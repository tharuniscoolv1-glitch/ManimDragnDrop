import React, { useState } from 'react';
import { useSettingsStore } from '../../store/settings-store';
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RefreshCw,
  FolderOpen,
  X,
  Terminal,
  ExternalLink
} from 'lucide-react';

export const EnvironmentSetupModal: React.FC = () => {
  const isOpen = useSettingsStore((s) => s.isSetupModalOpen);
  const setOpen = useSettingsStore((s) => s.setSetupModalOpen);
  const pythonEnv = useSettingsStore((s) => s.pythonEnv);
  const settings = useSettingsStore((s) => s.settings);
  const checkPythonEnv = useSettingsStore((s) => s.checkPythonEnv);
  const updateSettings = useSettingsStore((s) => s.updateSettings);

  const [customPath, setCustomPath] = useState(settings?.customPythonPath || '');
  const [testing, setTesting] = useState(false);

  if (!isOpen) return null;

  const handleBrowse = async () => {
    if (!window.manimStudio) return;
    const selected = await window.manimStudio.selectFile('Select Python Executable', [
      { name: 'Python Executable', extensions: ['exe', 'bat', 'cmd', ''] }
    ]);
    if (selected) {
      setCustomPath(selected);
    }
  };

  const handleRetest = async () => {
    setTesting(true);
    try {
      await updateSettings({ customPythonPath: customPath.trim() });
      await checkPythonEnv(customPath.trim());
    } finally {
      setTesting(false);
    }
  };

  const p = pythonEnv?.python;
  const m = pythonEnv?.manim;
  const f = pythonEnv?.ffmpeg;
  const l = pythonEnv?.latex;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-xl bg-dark-850 border border-dark-700 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-dark-700 bg-dark-800">
          <div className="flex items-center space-x-2.5">
            <Terminal size={18} className="text-blue-400" />
            <h3 className="font-bold text-sm text-white">Python Environment Setup</h3>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          <p className="text-slate-400">
            Manim Node Studio renders scenes locally using your Python Manim Community installation.
          </p>

          {/* Checklist */}
          <div className="space-y-2.5">
            {/* Python */}
            <div className="p-3 bg-dark-900 border border-dark-700 rounded-lg flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-100">Python Interpreter (3.9+)</span>
                  {p?.found ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                      {p.version}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-800">
                      Not Found
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {p?.found ? `Path: ${p.path}` : 'Install Python 3.9 or higher and add it to your system PATH.'}
                </p>
              </div>
              {p?.found ? <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" /> : <XCircle size={18} className="text-red-400 flex-shrink-0" />}
            </div>

            {/* Manim */}
            <div className="p-3 bg-dark-900 border border-dark-700 rounded-lg flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-100">Manim Community Edition</span>
                  {m?.found ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                      {m.version}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-800">
                      Missing
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {m?.found ? 'Manim Community is installed and ready to render.' : 'Install via terminal: pip install manim'}
                </p>
              </div>
              {m?.found ? <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" /> : <XCircle size={18} className="text-red-400 flex-shrink-0" />}
            </div>

            {/* FFmpeg */}
            <div className="p-3 bg-dark-900 border border-dark-700 rounded-lg flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-100">FFmpeg (Video Engine)</span>
                  {f?.found ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono truncate max-w-xs">
                      {f.version?.split(' ')[2] || 'Installed'}
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-red-950 text-red-400 border border-red-800">
                      Not Found
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {f?.found ? 'FFmpeg is available for video encoding.' : 'Windows: winget install Gyan.FFmpeg | macOS: brew install ffmpeg'}
                </p>
              </div>
              {f?.found ? <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" /> : <XCircle size={18} className="text-red-400 flex-shrink-0" />}
            </div>

            {/* LaTeX */}
            <div className="p-3 bg-dark-900 border border-dark-700 rounded-lg flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-slate-100">LaTeX (Optional for MathTex)</span>
                  {l?.found ? (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-800 font-mono">
                      Installed
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.5 rounded text-[10px] bg-amber-950 text-amber-400 border border-amber-800">
                      Optional (Not Installed)
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  {l?.found
                    ? 'LaTeX compiler is available for rendering mathematical equations.'
                    : 'Only needed if you use MathTex nodes. You can use standard Text nodes without LaTeX. (Install MiKTeX on Windows or MacTeX on macOS if desired).'}
                </p>
              </div>
              {l?.found ? <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" /> : <AlertTriangle size={18} className="text-amber-400 flex-shrink-0" />}
            </div>
          </div>

          {/* Custom Python Path Setting */}
          <div className="pt-2 border-t border-dark-700 space-y-2">
            <label className="font-semibold text-slate-300">Custom Python or Virtualenv Path</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={customPath}
                onChange={(e) => setCustomPath(e.target.value)}
                placeholder="e.g. C:\Python311\python.exe or .venv/Scripts/python.exe"
                className="flex-1 px-3 py-1.5 bg-dark-900 border border-dark-700 rounded text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
              />
              <button
                onClick={handleBrowse}
                className="px-2.5 py-1.5 bg-dark-800 hover:bg-dark-700 border border-dark-700 rounded text-slate-300 transition-colors flex items-center space-x-1"
                title="Browse for python executable"
              >
                <FolderOpen size={14} />
                <span>Browse</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-dark-700 bg-dark-800">
          <button
            onClick={handleRetest}
            disabled={testing}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-dark-700 hover:bg-dark-600 text-slate-200 rounded text-xs transition-colors cursor-pointer"
          >
            <RefreshCw size={13} className={testing ? 'animate-spin' : ''} />
            <span>{testing ? 'Detecting...' : 'Re-test Environment'}</span>
          </button>

          <button
            onClick={() => setOpen(false)}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
