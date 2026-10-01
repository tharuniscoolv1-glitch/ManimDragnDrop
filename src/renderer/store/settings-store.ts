import { create } from 'zustand';
import type { PythonEnvironmentInfo, AppSettings } from '@shared/ipc-types';

export interface SettingsState {
  pythonEnv: PythonEnvironmentInfo | null;
  settings: AppSettings | null;
  isLoading: boolean;
  isSetupModalOpen: boolean;
  isSettingsModalOpen: boolean;
  isExamplesModalOpen: boolean;

  setSetupModalOpen: (open: boolean) => void;
  setSettingsModalOpen: (open: boolean) => void;
  setExamplesModalOpen: (open: boolean) => void;

  checkPythonEnv: (customPath?: string) => Promise<PythonEnvironmentInfo | null>;
  loadSettings: () => Promise<void>;
  updateSettings: (partial: Partial<AppSettings>) => Promise<void>;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  pythonEnv: null,
  settings: null,
  isLoading: false,
  isSetupModalOpen: false,
  isSettingsModalOpen: false,
  isExamplesModalOpen: false,

  setSetupModalOpen: (open) => set({ isSetupModalOpen: open }),
  setSettingsModalOpen: (open) => set({ isSettingsModalOpen: open }),
  setExamplesModalOpen: (open) => set({ isExamplesModalOpen: open }),

  checkPythonEnv: async (customPath?: string) => {
    if (!window.manimStudio) return null;
    set({ isLoading: true });
    try {
      const info = await window.manimStudio.detectPython(customPath);
      set({ pythonEnv: info, isLoading: false });
      return info;
    } catch (err) {
      console.error('Failed to detect Python environment:', err);
      set({ isLoading: false });
      return null;
    }
  },

  loadSettings: async () => {
    if (!window.manimStudio) return;
    try {
      const s = await window.manimStudio.getSettings();
      set({ settings: s });
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  },

  updateSettings: async (partial) => {
    if (!window.manimStudio) return;
    try {
      const updated = await window.manimStudio.saveSettings(partial);
      set({ settings: updated });
    } catch (err) {
      console.error('Failed to update settings:', err);
    }
  }
}));
