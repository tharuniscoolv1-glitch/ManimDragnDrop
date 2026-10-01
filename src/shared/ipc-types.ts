export interface PythonComponentStatus {
  found: boolean;
  version?: string;
  path?: string;
  error?: string;
}

export interface PythonEnvironmentInfo {
  python: PythonComponentStatus;
  manim: PythonComponentStatus;
  ffmpeg: PythonComponentStatus;
  latex: PythonComponentStatus;
  allRequiredReady: boolean; // python + manim + ffmpeg
}

export type RenderQuality = 'low' | 'medium' | 'high' | 'four_k';
export type RenderFormat = 'mp4' | 'gif' | 'webm' | 'png';

export interface RenderRequest {
  renderId: string;
  sceneCode: string;
  sceneClassName: string;
  quality: RenderQuality;
  format: RenderFormat;
  fps?: number;
  resolution?: [number, number];
  transparent?: boolean;
  customPythonPath?: string;
  outputPath?: string;
}

export interface RenderLogEvent {
  renderId: string;
  text: string;
  stream: 'stdout' | 'stderr';
  timestamp: number;
}

export interface RenderProgressEvent {
  renderId: string;
  percentage: number; // 0 to 100
  message: string;
}

export interface RenderCompleteEvent {
  renderId: string;
  success: boolean;
  videoUrl?: string; // safe app://media URL or file URL
  filePath?: string;
  error?: string;
}

export interface AppSettings {
  customPythonPath: string;
  defaultQuality: RenderQuality;
  defaultFormat: RenderFormat;
  autoSaveIntervalSeconds: number;
  theme: 'dark';
  defaultExportDirectory?: string;
}

export interface SaveProjectResult {
  success: boolean;
  filePath?: string;
  canceled?: boolean;
  error?: string;
}

export interface OpenProjectResult {
  success: boolean;
  filePath?: string;
  fileContent?: string;
  canceled?: boolean;
  error?: string;
}

export interface RecoveryCheckResult {
  hasRecovery: boolean;
  recoveryContent?: string;
  timestamp?: number;
}

// IPC Channel Constants
export const IPC_CHANNELS = {
  PYTHON_DETECT: 'python:detect',
  SETTINGS_GET: 'settings:get',
  SETTINGS_SAVE: 'settings:save',
  RENDER_START: 'render:start',
  RENDER_CANCEL: 'render:cancel',
  RENDER_LOG: 'render:log',
  RENDER_PROGRESS: 'render:progress',
  RENDER_COMPLETE: 'render:complete',
  PROJECT_SAVE: 'project:save',
  PROJECT_OPEN: 'project:open',
  PROJECT_EXPORT_PYTHON: 'project:export-python',
  PROJECT_AUTOSAVE: 'project:autosave',
  PROJECT_CHECK_RECOVERY: 'project:check-recovery',
  PROJECT_DISCARD_RECOVERY: 'project:discard-recovery',
  DIALOG_SELECT_FILE: 'dialog:select-file',
  DIALOG_SELECT_FOLDER: 'dialog:select-folder'
} as const;

// Typed API exposed through contextBridge
export interface ManimStudioAPI {
  detectPython: (customPath?: string) => Promise<PythonEnvironmentInfo>;
  getSettings: () => Promise<AppSettings>;
  saveSettings: (settings: Partial<AppSettings>) => Promise<AppSettings>;
  startRender: (req: RenderRequest) => Promise<{ success: boolean; error?: string }>;
  cancelRender: (renderId: string) => Promise<{ success: boolean }>;
  onRenderLog: (callback: (data: RenderLogEvent) => void) => () => void;
  onRenderProgress: (callback: (data: RenderProgressEvent) => void) => () => void;
  onRenderComplete: (callback: (data: RenderCompleteEvent) => void) => () => void;
  saveProject: (projectJson: string, filePath?: string) => Promise<SaveProjectResult>;
  openProject: (filePath?: string) => Promise<OpenProjectResult>;
  exportPython: (code: string, defaultName?: string) => Promise<SaveProjectResult>;
  autosaveProject: (projectJson: string) => Promise<{ success: boolean }>;
  checkRecovery: () => Promise<RecoveryCheckResult>;
  discardRecovery: () => Promise<{ success: boolean }>;
  selectFile: (title?: string, filters?: { name: string; extensions: string[] }[]) => Promise<string | null>;
  selectFolder: (title?: string) => Promise<string | null>;
}
