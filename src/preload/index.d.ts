import type { ManimStudioAPI } from '../shared/ipc-types';

declare global {
  interface Window {
    manimStudio: ManimStudioAPI;
  }
}
