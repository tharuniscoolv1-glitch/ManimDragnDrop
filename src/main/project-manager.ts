import { app, dialog, BrowserWindow } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import type { SaveProjectResult, OpenProjectResult, RecoveryCheckResult } from '../shared/ipc-types';

export class ProjectManager {
  private autosavePath: string;

  constructor() {
    this.autosavePath = path.join(app.getPath('userData'), 'autosave.mnproj');
  }

  private getFocusedWindow(): BrowserWindow | undefined {
    return BrowserWindow.getFocusedWindow() || BrowserWindow.getAllWindows()[0];
  }

  public async saveProject(projectJson: string, filePath?: string): Promise<SaveProjectResult> {
    try {
      let targetPath = filePath;

      if (!targetPath) {
        const win = this.getFocusedWindow();
        const res = await dialog.showSaveDialog(win!, {
          title: 'Save Manim Project',
          defaultPath: 'animation.mnproj',
          filters: [{ name: 'Manim Node Studio Project', extensions: ['mnproj'] }]
        });

        if (res.canceled || !res.filePath) {
          return { success: false, canceled: true };
        }
        targetPath = res.filePath;
      }

      fs.writeFileSync(targetPath, projectJson, 'utf-8');
      return { success: true, filePath: targetPath };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async openProject(filePath?: string): Promise<OpenProjectResult> {
    try {
      let targetPath = filePath;

      if (!targetPath) {
        const win = this.getFocusedWindow();
        const res = await dialog.showOpenDialog(win!, {
          title: 'Open Manim Project',
          properties: ['openFile'],
          filters: [{ name: 'Manim Node Studio Project', extensions: ['mnproj'] }]
        });

        if (res.canceled || !res.filePaths || res.filePaths.length === 0) {
          return { success: false, canceled: true };
        }
        targetPath = res.filePaths[0];
      }

      if (!fs.existsSync(targetPath)) {
        return { success: false, error: 'File does not exist' };
      }

      const content = fs.readFileSync(targetPath, 'utf-8');
      return { success: true, filePath: targetPath, fileContent: content };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async exportPython(pythonCode: string, defaultName: string = 'scene.py'): Promise<SaveProjectResult> {
    try {
      const win = this.getFocusedWindow();
      const res = await dialog.showSaveDialog(win!, {
        title: 'Export Standalone Python Scene',
        defaultPath: defaultName.endsWith('.py') ? defaultName : `${defaultName}.py`,
        filters: [{ name: 'Python Scene Script', extensions: ['py'] }]
      });

      if (res.canceled || !res.filePath) {
        return { success: false, canceled: true };
      }

      fs.writeFileSync(res.filePath, pythonCode, 'utf-8');
      return { success: true, filePath: res.filePath };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  }

  public async autosave(projectJson: string): Promise<{ success: boolean }> {
    try {
      fs.writeFileSync(this.autosavePath, projectJson, 'utf-8');
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  public async checkRecovery(): Promise<RecoveryCheckResult> {
    try {
      if (fs.existsSync(this.autosavePath)) {
        const stat = fs.statSync(this.autosavePath);
        const content = fs.readFileSync(this.autosavePath, 'utf-8');
        return {
          hasRecovery: true,
          recoveryContent: content,
          timestamp: stat.mtimeMs
        };
      }
    } catch (err) {
      console.error('Failed to read recovery file:', err);
    }
    return { hasRecovery: false };
  }

  public async discardRecovery(): Promise<{ success: boolean }> {
    try {
      if (fs.existsSync(this.autosavePath)) {
        fs.unlinkSync(this.autosavePath);
      }
      return { success: true };
    } catch {
      return { success: false };
    }
  }

  public async selectFile(title?: string, filters?: { name: string; extensions: string[] }[]): Promise<string | null> {
    const win = this.getFocusedWindow();
    const res = await dialog.showOpenDialog(win!, {
      title: title || 'Select File',
      properties: ['openFile'],
      filters: filters || []
    });
    if (res.canceled || !res.filePaths || res.filePaths.length === 0) return null;
    return res.filePaths[0];
  }

  public async selectFolder(title?: string): Promise<string | null> {
    const win = this.getFocusedWindow();
    const res = await dialog.showOpenDialog(win!, {
      title: title || 'Select Directory',
      properties: ['openDirectory']
    });
    if (res.canceled || !res.filePaths || res.filePaths.length === 0) return null;
    return res.filePaths[0];
  }
}
