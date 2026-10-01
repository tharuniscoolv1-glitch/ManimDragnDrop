import React, { useState, useRef, useEffect } from 'react';
import { useGraphStore } from '../../store/graph-store';
import { useSettingsStore } from '../../store/settings-store';
import {
  FolderOpen,
  Save,
  FilePlus,
  Undo2,
  Redo2,
  Settings,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileCode,
  BookOpen
} from 'lucide-react';

export const TopBar: React.FC = () => {
  const projectName = useGraphStore((s) => s.projectName);
  const isDirty = useGraphStore((s) => s.isDirty);
  const filePath = useGraphStore((s) => s.filePath);
  const newProject = useGraphStore((s) => s.newProject);
  const loadProject = useGraphStore((s) => s.loadProject);
  const getProjectFile = useGraphStore((s) => s.getProjectFile);
  const undo = useGraphStore((s) => s.undo);
  const redo = useGraphStore((s) => s.redo);
  const canUndo = useGraphStore((s) => s.canUndo());
  const canRedo = useGraphStore((s) => s.canRedo());
  const compileResult = useGraphStore((s) => s.compileResult);

  const pythonEnv = useSettingsStore((s) => s.pythonEnv);
  const setSetupModalOpen = useSettingsStore((s) => s.setSetupModalOpen);
  const setSettingsModalOpen = useSettingsStore((s) => s.setSettingsModalOpen);
  const setExamplesModalOpen = useSettingsStore((s) => s.setExamplesModalOpen);

  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const fileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(e.target as Node)) {
        setIsFileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSave = async (forceSaveAs: boolean = false) => {
    if (!window.manimStudio) return;
    const project = getProjectFile();
    const json = JSON.stringify(project, null, 2);
    const targetPath = forceSaveAs ? undefined : filePath;
    const res = await window.manimStudio.saveProject(json, targetPath);
    if (res.success && res.filePath) {
      loadProject(project, res.filePath);
    }
  };

  const handleOpen = async () => {
    if (!window.manimStudio) return;
    const res = await window.manimStudio.openProject();
    if (res.success && res.fileContent) {
      try {
        const parsed = JSON.parse(res.fileContent);
        loadProject(parsed, res.filePath);
      } catch (err) {
        console.error('Failed to parse project file:', err);
      }
    }
  };

  const handleExportPython = async () => {
    if (!window.manimStudio || !compileResult) return;
    await window.manimStudio.exportPython(compileResult.pythonCode, `${compileResult.sceneClassName}.py`);
  };

  const isPythonReady = pythonEnv?.allRequiredReady;
  const isLatexMissing = isPythonReady && !pythonEnv?.latex.found;

  return (
    <div className="h-11 bg-dark-850 border-b border-dark-700 flex items-center justify-between px-3 select-none flex-shrink-0 z-20">
      {/* Left: Branding & Menus */}
      <div className="flex items-center space-x-3">
        {/* App Title */}
        <div className="flex items-center space-x-2 font-bold text-sm text-white tracking-wide">
          <div className="w-5 h-5 rounded bg-gradient-to-tr from-blue-600 to-emerald-400 flex items-center justify-center text-[10px] text-white font-mono shadow">
            M
          </div>
          <span>Manim Node Studio</span>
        </div>

        {/* File Dropdown Menu */}
        <div className="relative" ref={fileMenuRef}>
          <button
            onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white hover:bg-dark-800 rounded transition-colors cursor-pointer"
          >
            <span>File</span>
            <ChevronDown size={12} />
          </button>

          {isFileMenuOpen && (
            <div className="absolute left-0 top-8 w-52 bg-dark-850 border border-dark-700 rounded-lg shadow-2xl py-1 text-xs text-slate-200 z-50">
              <button
                onClick={() => {
                  newProject();
                  setIsFileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-1.5 hover:bg-dark-800 transition-colors text-left"
              >
                <FilePlus size={14} className="text-slate-400" />
                <span className="flex-1">New Project</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+N</span>
              </button>

              <button
                onClick={() => {
                  handleOpen();
                  setIsFileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-1.5 hover:bg-dark-800 transition-colors text-left"
              >
                <FolderOpen size={14} className="text-slate-400" />
                <span className="flex-1">Open...</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+O</span>
              </button>

              <button
                onClick={() => {
                  handleSave(false);
                  setIsFileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-1.5 hover:bg-dark-800 transition-colors text-left"
              >
                <Save size={14} className="text-slate-400" />
                <span className="flex-1">Save</span>
                <span className="text-[10px] text-slate-400 font-mono">Ctrl+S</span>
              </button>

              <button
                onClick={() => {
                  handleSave(true);
                  setIsFileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-1.5 hover:bg-dark-800 transition-colors text-left"
              >
                <Save size={14} className="text-slate-400" />
                <span className="flex-1">Save As...</span>
              </button>

              <div className="border-t border-dark-700 my-1" />

              <button
                onClick={() => {
                  handleExportPython();
                  setIsFileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-1.5 hover:bg-dark-800 transition-colors text-left"
              >
                <FileCode size={14} className="text-blue-400" />
                <span className="flex-1">Export Python (.py)</span>
              </button>

              <button
                onClick={() => {
                  setExamplesModalOpen(true);
                  setIsFileMenuOpen(false);
                }}
                className="w-full flex items-center space-x-2.5 px-3 py-1.5 hover:bg-dark-800 transition-colors text-left text-amber-300"
              >
                <BookOpen size={14} />
                <span className="flex-1">Example Projects...</span>
              </button>
            </div>
          )}
        </div>

        {/* Undo / Redo buttons */}
        <div className="flex items-center space-x-0.5 border-l border-dark-700 pl-2">
          <button
            onClick={undo}
            disabled={!canUndo}
            className="p-1.5 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-dark-800 rounded transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 size={14} />
          </button>
          <button
            onClick={redo}
            disabled={!canRedo}
            className="p-1.5 text-slate-300 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-dark-800 rounded transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo2 size={14} />
          </button>
        </div>
      </div>

      {/* Center: Current Project Name */}
      <div className="flex items-center space-x-1.5 text-xs text-slate-300 font-medium truncate max-w-sm">
        <span className="truncate">{projectName}</span>
        {isDirty && <span className="text-blue-400 font-bold" title="Unsaved changes">•</span>}
      </div>

      {/* Right: Environment Status & Settings */}
      <div className="flex items-center space-x-3">
        {/* Python Environment Badge */}
        <button
          onClick={() => setSetupModalOpen(true)}
          className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors cursor-pointer ${
            !isPythonReady
              ? 'bg-red-950/60 border-red-800/80 text-red-300 hover:bg-red-900/60'
              : isLatexMissing
              ? 'bg-amber-950/60 border-amber-800/80 text-amber-300 hover:bg-amber-900/60'
              : 'bg-emerald-950/60 border-emerald-800/80 text-emerald-300 hover:bg-emerald-900/60'
          }`}
          title="Click to view Python, Manim, FFmpeg, and LaTeX installation status"
        >
          {!isPythonReady ? (
            <>
              <XCircle size={13} className="text-red-400" />
              <span>Python / Manim Missing</span>
            </>
          ) : isLatexMissing ? (
            <>
              <AlertTriangle size={13} className="text-amber-400" />
              <span>Manim Ready (No LaTeX)</span>
            </>
          ) : (
            <>
              <CheckCircle2 size={13} className="text-emerald-400" />
              <span>Manim Ready</span>
            </>
          )}
        </button>

        {/* Examples Quick Button */}
        <button
          onClick={() => setExamplesModalOpen(true)}
          className="flex items-center space-x-1 px-2.5 py-1 text-xs text-slate-300 hover:text-white bg-dark-800 hover:bg-dark-750 border border-dark-700 rounded transition-colors cursor-pointer"
        >
          <Sparkles size={13} className="text-amber-400" />
          <span>Examples</span>
        </button>

        {/* Settings Button */}
        <button
          onClick={() => setSettingsModalOpen(true)}
          className="p-1.5 text-slate-300 hover:text-white hover:bg-dark-800 rounded transition-colors cursor-pointer"
          title="Settings"
        >
          <Settings size={15} />
        </button>
      </div>
    </div>
  );
};
