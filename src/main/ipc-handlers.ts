import { ipcMain } from 'electron';
import { IPC_CHANNELS } from '../shared/ipc-types';
import type { RenderRequest, AppSettings } from '../shared/ipc-types';
import { SettingsStore } from './settings-store';
import { detectPythonEnvironment } from './python-detector';
import { RenderManager } from './render-manager';
import { ProjectManager } from './project-manager';

export function registerIpcHandlers(
  settingsStore: SettingsStore,
  renderManager: RenderManager,
  projectManager: ProjectManager
): void {
  // Python environment detection
  ipcMain.handle(IPC_CHANNELS.PYTHON_DETECT, async (_event, customPath?: string) => {
    const settings = settingsStore.getSettings();
    const targetPath = customPath || settings.customPythonPath;
    const res = await detectPythonEnvironment(targetPath);
    if (res.python.found && res.python.path && !settings.customPythonPath) {
      settingsStore.updateSettings({ customPythonPath: res.python.path });
    }
    return res;
  });

  // Settings
  ipcMain.handle(IPC_CHANNELS.SETTINGS_GET, async () => {
    return settingsStore.getSettings();
  });

  ipcMain.handle(IPC_CHANNELS.SETTINGS_SAVE, async (_event, partial: Partial<AppSettings>) => {
    return settingsStore.updateSettings(partial);
  });

  // Rendering
  ipcMain.handle(IPC_CHANNELS.RENDER_START, async (_event, req: RenderRequest) => {
    const settings = settingsStore.getSettings();
    if (!req.customPythonPath && settings.customPythonPath) {
      req.customPythonPath = settings.customPythonPath;
    }
    return await renderManager.startRender(req);
  });

  ipcMain.handle(IPC_CHANNELS.RENDER_CANCEL, async (_event, renderId: string) => {
    return await renderManager.cancelRender(renderId);
  });

  // Project management
  ipcMain.handle(IPC_CHANNELS.PROJECT_SAVE, async (_event, projectJson: string, filePath?: string) => {
    return await projectManager.saveProject(projectJson, filePath);
  });

  ipcMain.handle(IPC_CHANNELS.PROJECT_OPEN, async (_event, filePath?: string) => {
    return await projectManager.openProject(filePath);
  });

  ipcMain.handle(IPC_CHANNELS.PROJECT_EXPORT_PYTHON, async (_event, code: string, defaultName?: string) => {
    return await projectManager.exportPython(code, defaultName);
  });

  ipcMain.handle(IPC_CHANNELS.PROJECT_AUTOSAVE, async (_event, projectJson: string) => {
    return await projectManager.autosave(projectJson);
  });

  ipcMain.handle(IPC_CHANNELS.PROJECT_CHECK_RECOVERY, async () => {
    return await projectManager.checkRecovery();
  });

  ipcMain.handle(IPC_CHANNELS.PROJECT_DISCARD_RECOVERY, async () => {
    return await projectManager.discardRecovery();
  });

  // Dialog helpers
  ipcMain.handle(IPC_CHANNELS.DIALOG_SELECT_FILE, async (_event, title?: string, filters?: any) => {
    return await projectManager.selectFile(title, filters);
  });

  ipcMain.handle(IPC_CHANNELS.DIALOG_SELECT_FOLDER, async (_event, title?: string) => {
    return await projectManager.selectFolder(title);
  });
}
