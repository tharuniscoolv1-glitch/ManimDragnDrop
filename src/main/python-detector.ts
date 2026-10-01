import { execFile, execSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import type { PythonComponentStatus, PythonEnvironmentInfo } from '../shared/ipc-types';

function runVersionCommand(cmd: string, args: string[]): Promise<{ success: boolean; version?: string; path?: string; error?: string }> {
  return new Promise((resolve) => {
    execFile(cmd, args, { timeout: 8000, windowsHide: true }, (err, stdout, stderr) => {
      if (err) {
        resolve({
          success: false,
          error: (stderr || err.message).trim()
        });
        return;
      }

      const output = (stdout || stderr || '').trim();
      const firstLine = output.split(/[\r\n]+/)[0] || '';
      resolve({
        success: true,
        version: firstLine,
        path: cmd
      });
    });
  });
}

function findPythonCandidates(customPath?: string): string[] {
  const candidates = new Set<string>();

  if (customPath && customPath.trim().length > 0) {
    candidates.add(customPath.trim());
  }

  if (process.platform === 'win32') {
    // 1. Check where.exe
    try {
      const stdout = execSync('where.exe python', { encoding: 'utf-8', timeout: 3000 });
      stdout.split(/[\r\n]+/).forEach((p) => {
        const trimmed = p.trim();
        // Ignore the Windows Store alias stub that opens the store
        if (trimmed && !trimmed.toLowerCase().includes('windowsapps')) {
          candidates.add(trimmed);
        }
      });
    } catch {}

    try {
      const stdout = execSync('where.exe py', { encoding: 'utf-8', timeout: 3000 });
      stdout.split(/[\r\n]+/).forEach((p) => {
        const trimmed = p.trim();
        if (trimmed) candidates.add(trimmed);
      });
    } catch {}

    // 2. Check well-known installation paths
    const commonPaths = [
      'C:\\Python314\\python.exe',
      'C:\\Python313\\python.exe',
      'C:\\Python312\\python.exe',
      'C:\\Python311\\python.exe',
      'C:\\Python310\\python.exe',
      'C:\\Python39\\python.exe',
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python314', 'python.exe'),
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python313', 'python.exe'),
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python312', 'python.exe'),
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python311', 'python.exe'),
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'Python', 'Python310', 'python.exe'),
      path.join(process.env.ProgramFiles || '', 'Python314', 'python.exe'),
      path.join(process.env['ProgramFiles(x86)'] || '', 'Python314', 'python.exe')
    ];

    for (const p of commonPaths) {
      if (fs.existsSync(p)) {
        candidates.add(p);
      }
    }

    candidates.add('python');
    candidates.add('py');
  } else {
    // macOS / Linux
    try {
      const stdout = execSync('which -a python3 python', { encoding: 'utf-8', timeout: 3000 });
      stdout.split(/[\r\n]+/).forEach((p) => {
        const trimmed = p.trim();
        if (trimmed) candidates.add(trimmed);
      });
    } catch {}
    candidates.add('python3');
    candidates.add('python');
  }

  return Array.from(candidates);
}

function findFfmpegCandidates(): string[] {
  const candidates = new Set<string>();

  if (process.platform === 'win32') {
    try {
      const stdout = execSync('where.exe ffmpeg', { encoding: 'utf-8', timeout: 3000 });
      stdout.split(/[\r\n]+/).forEach((p) => {
        const trimmed = p.trim();
        if (trimmed) candidates.add(trimmed);
      });
    } catch {}

    const commonPaths = [
      path.join(process.env.USERPROFILE || '', '.gemini', 'antigravity-cli', 'bin', 'ffmpeg.exe'),
      path.join(process.env.LOCALAPPDATA || '', 'Programs', 'ffmpeg', 'bin', 'ffmpeg.exe'),
      'C:\\ffmpeg\\bin\\ffmpeg.exe',
      'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
      'C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe'
    ];

    for (const p of commonPaths) {
      if (fs.existsSync(p)) {
        candidates.add(p);
      }
    }

    candidates.add('ffmpeg');
  } else {
    try {
      const stdout = execSync('which -a ffmpeg', { encoding: 'utf-8', timeout: 3000 });
      stdout.split(/[\r\n]+/).forEach((p) => {
        const trimmed = p.trim();
        if (trimmed) candidates.add(trimmed);
      });
    } catch {}
    candidates.add('ffmpeg');
  }

  return Array.from(candidates);
}

export async function detectPythonEnvironment(customPythonPath?: string): Promise<PythonEnvironmentInfo> {
  const pythonCandidates = findPythonCandidates(customPythonPath);

  let bestPythonStatus: PythonComponentStatus = { found: false, error: 'Python executable not found in PATH or standard directories' };
  let bestManimStatus: PythonComponentStatus = { found: false, error: 'Manim Community not installed in Python environment' };
  let selectedPythonCmd = 'python';

  // Evaluate each Python candidate to find one that has both Python and Manim
  for (const candidate of pythonCandidates) {
    const pyRes = await runVersionCommand(candidate, ['--version']);
    if (pyRes.success && pyRes.version) {
      const currentPyStatus: PythonComponentStatus = {
        found: true,
        version: pyRes.version,
        path: candidate
      };

      // Check if this candidate has manim
      const manimRes = await runVersionCommand(candidate, ['-m', 'manim', '--version']);
      if (manimRes.success && manimRes.version) {
        // Perfect match: Python + Manim both present!
        bestPythonStatus = currentPyStatus;
        bestManimStatus = {
          found: true,
          version: manimRes.version,
          path: `${candidate} -m manim`
        };
        selectedPythonCmd = candidate;
        break;
      } else if (!bestPythonStatus.found) {
        // Fallback: Python is found, but manim was not found on this particular interpreter
        bestPythonStatus = currentPyStatus;
        bestManimStatus = {
          found: false,
          error: manimRes.error || 'manim module not found'
        };
        selectedPythonCmd = candidate;
      }
    }
  }

  // Detect FFmpeg using candidates
  let ffmpegStatus: PythonComponentStatus = { found: false, error: 'FFmpeg not found in PATH or standard directories' };
  const ffmpegCandidates = findFfmpegCandidates();
  for (const candidate of ffmpegCandidates) {
    const ffmpegRes = await runVersionCommand(candidate, ['-version']);
    if (ffmpegRes.success && ffmpegRes.version) {
      ffmpegStatus = {
        found: true,
        version: ffmpegRes.version,
        path: candidate
      };

      // Add ffmpeg directory to process.env.PATH so child processes can invoke it
      if (candidate.includes(path.sep)) {
        const binDir = path.dirname(candidate);
        if (!process.env.PATH?.includes(binDir)) {
          process.env.PATH = `${binDir}${path.delimiter}${process.env.PATH || ''}`;
        }
      }
      break;
    }
  }

  // Detect LaTeX (optional, only required for Tex/MathTex nodes)
  const latexRes = await runVersionCommand('latex', ['--version']);
  let latexStatus: PythonComponentStatus = {
    found: latexRes.success,
    version: latexRes.version,
    path: latexRes.success ? 'latex' : undefined,
    error: latexRes.success ? undefined : 'LaTeX not detected (Tex/MathTex nodes will require LaTeX)'
  };

  const allRequiredReady = bestPythonStatus.found && bestManimStatus.found && ffmpegStatus.found;

  return {
    python: bestPythonStatus,
    manim: bestManimStatus,
    ffmpeg: ffmpegStatus,
    latex: latexStatus,
    allRequiredReady
  };
}
