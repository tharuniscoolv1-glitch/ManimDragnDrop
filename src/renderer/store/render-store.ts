import { create } from 'zustand';
import type { RenderQuality, RenderFormat, RenderLogEvent } from '@shared/ipc-types';

export type RenderStatus = 'idle' | 'rendering' | 'completed' | 'error';

export interface RenderState {
  status: RenderStatus;
  renderId: string | null;
  progress: number;
  progressMessage: string;
  logs: RenderLogEvent[];
  videoUrl: string | null;
  error: string | null;
  quality: RenderQuality;
  format: RenderFormat;

  setQuality: (quality: RenderQuality) => void;
  setFormat: (format: RenderFormat) => void;
  startRender: (renderId: string) => void;
  cancelRender: () => void;
  appendLog: (log: RenderLogEvent) => void;
  setProgress: (percentage: number, message: string) => void;
  setComplete: (success: boolean, videoUrl?: string, error?: string) => void;
  clearLogs: () => void;
}

export const useRenderStore = create<RenderState>((set, get) => ({
  status: 'idle',
  renderId: null,
  progress: 0,
  progressMessage: 'Ready to render',
  logs: [],
  videoUrl: null,
  error: null,
  quality: 'low',
  format: 'mp4',

  setQuality: (quality) => set({ quality }),
  setFormat: (format) => set({ format }),

  startRender: (renderId) => {
    set({
      status: 'rendering',
      renderId,
      progress: 5,
      progressMessage: 'Starting render...',
      error: null
    });
  },

  cancelRender: () => {
    const { renderId } = get();
    if (renderId && window.manimStudio) {
      window.manimStudio.cancelRender(renderId);
    }
    set({
      status: 'idle',
      progress: 0,
      progressMessage: 'Render canceled'
    });
  },

  appendLog: (log) => {
    set((state) => ({
      logs: [...state.logs.slice(-1000), log] // Keep last 1000 lines
    }));
  },

  setProgress: (percentage, message) => {
    set({
      progress: percentage,
      progressMessage: message
    });
  },

  setComplete: (success, videoUrl, error) => {
    set({
      status: success ? 'completed' : 'error',
      renderId: null,
      progress: success ? 100 : 0,
      progressMessage: success ? 'Render complete!' : (error || 'Render failed'),
      videoUrl: success ? (videoUrl || null) : null,
      error: error || null
    });
  },

  clearLogs: () => set({ logs: [] })
}));
