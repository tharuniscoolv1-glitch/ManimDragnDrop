import { app } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import type { AppSettings } from '../shared/ipc-types';

const defaultSettings: AppSettings = {
  customPythonPath: '',
  defaultQuality: 'low',
  defaultFormat: 'mp4',
  autoSaveIntervalSeconds: 30,
  theme: 'dark'
};

export class SettingsStore {
  private filePath: string;
  private settings: AppSettings;

  constructor() {
    const userData = app.getPath('userData');
    this.filePath = path.join(userData, 'manim-node-studio-settings.json');
    this.settings = this.load();
  }

  private load(): AppSettings {
    try {
      if (fs.existsSync(this.filePath)) {
        const raw = fs.readFileSync(this.filePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return { ...defaultSettings, ...parsed };
      }
    } catch (err) {
      console.error('Failed to load settings file, using defaults:', err);
    }
    return { ...defaultSettings };
  }

  public getSettings(): AppSettings {
    return { ...this.settings };
  }

  public updateSettings(partial: Partial<AppSettings>): AppSettings {
    this.settings = { ...this.settings, ...partial };
    try {
      fs.writeFileSync(this.filePath, JSON.stringify(this.settings, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to persist settings:', err);
    }
    return { ...this.settings };
  }
}
