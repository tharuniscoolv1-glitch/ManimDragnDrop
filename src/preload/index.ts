import { contextBridge, ipcRenderer } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc-types';
import type {
  ManimStudioAPI,
  PythonEnvironmentInfo,
  AppSettings,
  RenderRequest,
  RenderLogEvent,
  RenderProgressEvent,
  RenderCompleteEvent,
  SaveProjectResult,
  OpenProjectResult,
  RecoveryCheckResult
} from '../shared/ipc-types';

const api: ManimStudioAPI = {
  detectPython: (customPath?: string): Promise<PythonEnvironmentInfo> => {
    return ipcRenderer.invoke(IPC_CHANNELS.PYTHON_DETECT, customPath);
  },

  getSettings: (): Promise<AppSettings> => {
    return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_GET);
  },

  saveSettings: (settings: Partial<AppSettings>): Promise<AppSettings> => {
    return ipcRenderer.invoke(IPC_CHANNELS.SETTINGS_SAVE, settings);
  },

  startRender: (req: RenderRequest): Promise<{ success: boolean; error?: string }> => {
    return ipcRenderer.invoke(IPC_CHANNELS.RENDER_START, req);
  },

  cancelRender: (renderId: string): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke(IPC_CHANNELS.RENDER_CANCEL, renderId);
  },

  onRenderLog: (callback: (data: RenderLogEvent) => void): (() => void) => {
    const subscription = (_event: any, data: RenderLogEvent) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.RENDER_LOG, subscription);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.RENDER_LOG, subscription);
    };
  },

  onRenderProgress: (callback: (data: RenderProgressEvent) => void): (() => void) => {
    const subscription = (_event: any, data: RenderProgressEvent) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.RENDER_PROGRESS, subscription);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.RENDER_PROGRESS, subscription);
    };
  },

  onRenderComplete: (callback: (data: RenderCompleteEvent) => void): (() => void) => {
    const subscription = (_event: any, data: RenderCompleteEvent) => callback(data);
    ipcRenderer.on(IPC_CHANNELS.RENDER_COMPLETE, subscription);
    return () => {
      ipcRenderer.removeListener(IPC_CHANNELS.RENDER_COMPLETE, subscription);
    };
  },

  saveProject: (projectJson: string, filePath?: string): Promise<SaveProjectResult> => {
    return ipcRenderer.invoke(IPC_CHANNELS.PROJECT_SAVE, projectJson, filePath);
  },

  openProject: (filePath?: string): Promise<OpenProjectResult> => {
    return ipcRenderer.invoke(IPC_CHANNELS.PROJECT_OPEN, filePath);
  },

  exportPython: (code: string, defaultName?: string): Promise<SaveProjectResult> => {
    return ipcRenderer.invoke(IPC_CHANNELS.PROJECT_EXPORT_PYTHON, code, defaultName);
  },

  autosaveProject: (projectJson: string): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke(IPC_CHANNELS.PROJECT_AUTOSAVE, projectJson);
  },

  checkRecovery: (): Promise<RecoveryCheckResult> => {
    return ipcRenderer.invoke(IPC_CHANNELS.PROJECT_CHECK_RECOVERY);
  },

  discardRecovery: (): Promise<{ success: boolean }> => {
    return ipcRenderer.invoke(IPC_CHANNELS.PROJECT_DISCARD_RECOVERY);
  },

  selectFile: (title?: string, filters?: { name: string; extensions: string[] }[]): Promise<string | null> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SELECT_FILE, title, filters);
  },

  selectFolder: (title?: string): Promise<string | null> => {
    return ipcRenderer.invoke(IPC_CHANNELS.DIALOG_SELECT_FOLDER, title);
  }
};

contextBridge.exposeInMainWorld('manimStudio', api);
