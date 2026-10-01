import React, { useState } from 'react';
import { useSettingsStore } from '../../store/settings-store';
import { X, Settings, FolderOpen, Check } from 'lucide-react';
import type { RenderQuality, RenderFormat } from '@shared/ipc-types';

export const SettingsModal: React.FC = () => {
  const isOpen = useSettingsStore((s) => s.isSettingsModalOpen);
  const setOpen = useSettingsStore((s) => s.setSettingsModalOpen);
  const settings = useSettingsStore((s) => s.settings);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const [quality, setQuality] = useState<RenderQuality>(settings?.defaultQuality || 'low');
  const [format, setFormat] = useState<RenderFormat>(settings?.defaultFormat || 'mp4');
  const [pythonPath, setPythonPath] = useState(settings?.customPythonPath || '');
  const [autosaveInterval, setAutosaveInterval] = useState(settings?.autoSaveIntervalSeconds || 30);
  const [saved, setSaved] = useState(false);

  if (!isOpen) return null;

  const handleBrowsePython = async () => {
    if (!window.manimStudio) return;
    const selected = await window.manimStudio.selectFile('Select Python Executable');
    if (selected) {
      setPythonPath(selected);
    }
  };

  const handleSave = async () => {
    await updateSettings({
      defaultQuality: quality,
      defaultFormat: format,
      customPythonPath: pythonPath.trim(),
      autoSaveIntervalSeconds: autosaveInterval
    });
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      setOpen(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-lg bg-dark-850 border border-dark-700 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-dark-700 bg-dark-800">
          <div className="flex items-center space-x-2.5">
            <Settings size={18} className="text-blue-400" />
            <h3 className="font-bold text-sm text-white">Application Settings</h3>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 text-xs">
          {/* Default Quality */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Default Render Quality</label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as RenderQuality)}
              className="w-full px-3 py-1.5 bg-dark-900 border border-dark-700 rounded text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="low">Low (480p, 15fps) - Fast Preview</option>
              <option value="medium">Medium (720p, 30fps) - Standard</option>
              <option value="high">High (1080p, 60fps) - Production</option>
              <option value="four_k">4K (2160p, 60fps) - Ultra HD</option>
            </select>
          </div>

          {/* Default Format */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Default Video Format</label>
            <select
              value={format}
              onChange={(e) => setFormat(e.target.value as RenderFormat)}
              className="w-full px-3 py-1.5 bg-dark-900 border border-dark-700 rounded text-slate-200 focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="mp4">MP4 (H.264 Video)</option>
              <option value="gif">GIF (Animated image)</option>
              <option value="webm">WebM (VP9 Video)</option>
              <option value="png">PNG (Still frame image)</option>
            </select>
          </div>

          {/* Python Path */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Custom Python Executable</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={pythonPath}
                onChange={(e) => setPythonPath(e.target.value)}
                placeholder="Leave blank to use system PATH python"
                className="flex-1 px-3 py-1.5 bg-dark-900 border border-dark-700 rounded text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
              />
              <button
                onClick={handleBrowsePython}
                className="px-2.5 py-1.5 bg-dark-800 hover:bg-dark-750 border border-dark-700 rounded text-slate-300 flex items-center space-x-1"
              >
                <FolderOpen size={14} />
                <span>Browse</span>
              </button>
            </div>
          </div>

          {/* Autosave Interval */}
          <div className="space-y-1.5">
            <label className="font-semibold text-slate-300">Autosave Interval (Seconds)</label>
            <input
              type="number"
              min={10}
              max={300}
              step={5}
              value={autosaveInterval}
              onChange={(e) => setAutosaveInterval(parseInt(e.target.value, 10) || 30)}
              className="w-full px-3 py-1.5 bg-dark-900 border border-dark-700 rounded text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-2 px-5 py-3 border-t border-dark-700 bg-dark-800">
          <button
            onClick={() => setOpen(false)}
            className="px-3.5 py-1.5 text-slate-400 hover:text-white text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-1.5 px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
          >
            {saved ? <Check size={14} /> : null}
            <span>{saved ? 'Saved!' : 'Save Settings'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
