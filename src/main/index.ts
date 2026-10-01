import { app, BrowserWindow, shell } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import { registerMediaScheme, setupMediaProtocol } from './media-protocol';
import { SettingsStore } from './settings-store';
import { RenderManager } from './render-manager';
import { ProjectManager } from './project-manager';
import { registerIpcHandlers } from './ipc-handlers';

// Register custom protocol scheme before app is ready
registerMediaScheme();

let mainWindow: BrowserWindow | null = null;

function createWindow(): void {
  const preloadJs = path.join(__dirname, '../preload/index.js');
  const preloadMjs = path.join(__dirname, '../preload/index.mjs');
  const preloadPath = fs.existsSync(preloadJs) ? preloadJs : preloadMjs;

  const iconPath = path.join(__dirname, '../../resources/icon.png');

  mainWindow = new BrowserWindow({
    width: 1440,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    show: false,
    autoHideMenuBar: true,
    title: 'Manim Node Studio',
    icon: fs.existsSync(iconPath) ? iconPath : undefined,
    backgroundColor: '#0d1117',
    webPreferences: {
      preload: preloadPath,
      sandbox: true,
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow?.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  // HMR for renderer base on electron-vite cli
  // Load the remote URL for development or the local html file for production.
  if (process.env.ELECTRON_RENDERER_URL) {
    mainWindow.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
  }
}

app.whenReady().then(() => {
  setupMediaProtocol();

  const settingsStore = new SettingsStore();
  const renderManager = new RenderManager();
  const projectManager = new ProjectManager();

  registerIpcHandlers(settingsStore, renderManager, projectManager);

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
