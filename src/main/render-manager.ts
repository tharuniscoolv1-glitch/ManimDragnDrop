import { app, BrowserWindow } from 'electron';
import { spawn, ChildProcess } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type { RenderRequest, RenderLogEvent, RenderProgressEvent, RenderCompleteEvent } from '../shared/ipc-types';
import { IPC_CHANNELS } from '../shared/ipc-types';
import { getMediaUrl } from './media-protocol';

export class RenderManager {
  private activeProcess: ChildProcess | null = null;
  private activeRenderId: string | null = null;
  private tempBaseDir: string;

  constructor() {
    this.tempBaseDir = path.join(app.getPath('temp'), 'manim_node_studio_renders');
    if (!fs.existsSync(this.tempBaseDir)) {
      fs.mkdirSync(this.tempBaseDir, { recursive: true });
    }
  }

  private sendToRenderer(channel: string, data: any): void {
    const windows = BrowserWindow.getAllWindows();
    for (const win of windows) {
      if (!win.isDestroyed()) {
        win.webContents.send(channel, data);
      }
    }
  }

  public async startRender(req: RenderRequest): Promise<{ success: boolean; error?: string }> {
    // If a render is already running, cancel it first
    if (this.activeProcess && this.activeRenderId) {
      await this.cancelRender(this.activeRenderId);
    }

    this.activeRenderId = req.renderId;
    const renderDir = path.join(this.tempBaseDir, req.renderId);
    fs.mkdirSync(renderDir, { recursive: true });

    const sceneFilePath = path.join(renderDir, 'scene.py');
    fs.writeFileSync(sceneFilePath, req.sceneCode, 'utf-8');

    // Build args array safely
    const pythonExe = req.customPythonPath && req.customPythonPath.trim().length > 0
      ? req.customPythonPath.trim()
      : 'python';

    const args: string[] = ['-m', 'manim', 'render'];

    // Quality flag
    switch (req.quality) {
      case 'low':
        args.push('-ql');
        break;
      case 'medium':
        args.push('-qm');
        break;
      case 'high':
        args.push('-qh');
        break;
      case 'four_k':
        args.push('-qk');
        break;
      default:
        args.push('-ql');
    }

    // Format flags
    if (req.format === 'gif') {
      args.push('--format=gif');
    } else if (req.format === 'png') {
      args.push('-s'); // Save last frame
    } else if (req.format === 'webm') {
      args.push('--format=webm');
    }

    // Transparency
    if (req.transparent) {
      args.push('-t');
    }

    // Resolution & FPS if custom
    if (req.resolution && req.resolution.length === 2) {
      args.push('-r', `${req.resolution[0]},${req.resolution[1]}`);
    }
    if (req.fps) {
      args.push('--fps', `${req.fps}`);
    }

    // Output directory inside the temp folder
    args.push('--media_dir', path.join(renderDir, 'media'));

    // Scene file and class name
    args.push(sceneFilePath);
    args.push(req.sceneClassName);

    this.sendToRenderer(IPC_CHANNELS.RENDER_LOG, {
      renderId: req.renderId,
      text: `Starting render: ${pythonExe} ${args.join(' ')}\n`,
      stream: 'stdout',
      timestamp: Date.now()
    } as RenderLogEvent);

    this.sendToRenderer(IPC_CHANNELS.RENDER_PROGRESS, {
      renderId: req.renderId,
      percentage: 5,
      message: 'Initializing Manim subprocess...'
    } as RenderProgressEvent);

    try {
      const envPath = process.env.PATH || process.env.Path || '';
      const extraPaths: string[] = [];
      if (pythonExe.includes(path.sep)) {
        extraPaths.push(path.dirname(pythonExe));
        extraPaths.push(path.join(path.dirname(pythonExe), 'Scripts'));
      }
      const combinedPath = [...extraPaths, envPath].join(path.delimiter);

      const child = spawn(pythonExe, args, {
        cwd: renderDir,
        windowsHide: true,
        env: {
          ...process.env,
          PATH: combinedPath,
          Path: combinedPath,
          PYTHONUNBUFFERED: '1'
        }
      });

      this.activeProcess = child;

      const handleOutput = (chunk: Buffer, stream: 'stdout' | 'stderr') => {
        const text = chunk.toString('utf-8');
        this.sendToRenderer(IPC_CHANNELS.RENDER_LOG, {
          renderId: req.renderId,
          text,
          stream,
          timestamp: Date.now()
        } as RenderLogEvent);

        // Parse progress
        this.parseProgress(req.renderId, text);
      };

      child.stdout?.on('data', (d) => handleOutput(d, 'stdout'));
      child.stderr?.on('data', (d) => handleOutput(d, 'stderr'));

      child.on('error', (err) => {
        this.sendToRenderer(IPC_CHANNELS.RENDER_LOG, {
          renderId: req.renderId,
          text: `\nSubprocess spawn error: ${err.message}\n`,
          stream: 'stderr',
          timestamp: Date.now()
        } as RenderLogEvent);

        this.sendToRenderer(IPC_CHANNELS.RENDER_COMPLETE, {
          renderId: req.renderId,
          success: false,
          error: `Failed to spawn Python process: ${err.message}`
        } as RenderCompleteEvent);

        this.activeProcess = null;
        this.activeRenderId = null;
      });

      child.on('close', (code) => {
        if (this.activeRenderId !== req.renderId) {
          // Was canceled or replaced
          return;
        }

        this.activeProcess = null;
        this.activeRenderId = null;

        if (code === 0) {
          // Look for generated media
          const mediaDir = path.join(renderDir, 'media');
          const outputFile = this.findNewestMediaFile(mediaDir);

          if (outputFile) {
            const mediaUrl = getMediaUrl(outputFile);
            this.sendToRenderer(IPC_CHANNELS.RENDER_PROGRESS, {
              renderId: req.renderId,
              percentage: 100,
              message: 'Render complete!'
            } as RenderProgressEvent);

            this.sendToRenderer(IPC_CHANNELS.RENDER_COMPLETE, {
              renderId: req.renderId,
              success: true,
              videoUrl: mediaUrl,
              filePath: outputFile
            } as RenderCompleteEvent);
          } else {
            this.sendToRenderer(IPC_CHANNELS.RENDER_COMPLETE, {
              renderId: req.renderId,
              success: false,
              error: 'Render completed but no output media file was found.'
            } as RenderCompleteEvent);
          }
        } else {
          this.sendToRenderer(IPC_CHANNELS.RENDER_COMPLETE, {
            renderId: req.renderId,
            success: false,
            error: `Manim process exited with error code ${code}`
          } as RenderCompleteEvent);
        }
      });

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async cancelRender(renderId: string): Promise<{ success: boolean }> {
    if (this.activeProcess && this.activeRenderId === renderId) {
      const pid = this.activeProcess.pid;
      if (pid) {
        if (process.platform === 'win32') {
          spawn('taskkill', ['/pid', pid.toString(), '/T', '/F'], { windowsHide: true });
        } else {
          try {
            process.kill(-pid, 'SIGKILL');
          } catch {
            this.activeProcess.kill('SIGKILL');
          }
        }
      }
      this.sendToRenderer(IPC_CHANNELS.RENDER_LOG, {
        renderId,
        text: '\n[Render canceled by user]\n',
        stream: 'stderr',
        timestamp: Date.now()
      } as RenderLogEvent);

      this.sendToRenderer(IPC_CHANNELS.RENDER_COMPLETE, {
        renderId,
        success: false,
        error: 'Render was canceled'
      } as RenderCompleteEvent);

      this.activeProcess = null;
      this.activeRenderId = null;
      return { success: true };
    }
    return { success: false };
  }

  private parseProgress(renderId: string, text: string): void {
    // Check for "Animation X: YY%|" or "XX%|"
    const percentMatch = text.match(/(\d{1,3})%/);
    if (percentMatch) {
      const p = parseInt(percentMatch[1], 10);
      if (!isNaN(p) && p >= 0 && p <= 100) {
        this.sendToRenderer(IPC_CHANNELS.RENDER_PROGRESS, {
          renderId,
          percentage: Math.min(99, Math.max(10, p)),
          message: `Rendering animation: ${p}%`
        } as RenderProgressEvent);
        return;
      }
    }

    // Check for "Animation X of Y" or "Writing frame X/Y"
    const ratioMatch = text.match(/(\d+)\/(\d+)\s+\[/);
    if (ratioMatch) {
      const cur = parseInt(ratioMatch[1], 10);
      const total = parseInt(ratioMatch[2], 10);
      if (total > 0) {
        const p = Math.round((cur / total) * 100);
        this.sendToRenderer(IPC_CHANNELS.RENDER_PROGRESS, {
          renderId,
          percentage: Math.min(99, Math.max(10, p)),
          message: `Processing frames: ${cur}/${total} (${p}%)`
        } as RenderProgressEvent);
      }
    }
  }

  private findNewestMediaFile(dir: string): string | null {
    if (!fs.existsSync(dir)) return null;

    let newestFile: string | null = null;
    let newestMtime = 0;

    const walk = (currentDir: string) => {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });
      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);
        if (entry.isDirectory()) {
          walk(fullPath);
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (['.mp4', '.gif', '.webm', '.png'].includes(ext)) {
            const stat = fs.statSync(fullPath);
            if (stat.mtimeMs > newestMtime) {
              newestMtime = stat.mtimeMs;
              newestFile = fullPath;
            }
          }
        }
      }
    };

    walk(dir);
    return newestFile;
  }
}
