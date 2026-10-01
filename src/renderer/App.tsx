import React, { useEffect, useRef } from 'react';
import { TopBar } from './components/topbar/TopBar';
import { NodePalette } from './components/sidebar/NodePalette';
import { NodeCanvas } from './components/canvas/NodeCanvas';
import { RightPanel } from './components/panels/RightPanel';
import { VideoPreviewArea } from './components/preview/VideoPreviewArea';
import { EnvironmentSetupModal } from './components/modals/EnvironmentSetupModal';
import { SettingsModal } from './components/modals/SettingsModal';
import { ExamplesModal } from './components/modals/ExamplesModal';

import { useGraphStore } from './store/graph-store';
import { useRenderStore } from './store/render-store';
import { useSettingsStore } from './store/settings-store';
import { compileGraphToPython } from './core/compiler/code-generator';

export const App: React.FC = () => {
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const isDirty = useGraphStore((s) => s.isDirty);
  const setCompileResult = useGraphStore((s) => s.setCompileResult);
  const getProjectFile = useGraphStore((s) => s.getProjectFile);
  const loadProject = useGraphStore((s) => s.loadProject);
  const undo = useGraphStore((s) => s.undo);
  const redo = useGraphStore((s) => s.redo);
  const filePath = useGraphStore((s) => s.filePath);

  const appendLog = useRenderStore((s) => s.appendLog);
  const setProgress = useRenderStore((s) => s.setProgress);
  const setComplete = useRenderStore((s) => s.setComplete);
  const startRender = useRenderStore((s) => s.startRender);
  const format = useRenderStore((s) => s.format);
  const compileResult = useGraphStore((s) => s.compileResult);

  const pythonEnv = useSettingsStore((s) => s.pythonEnv);
  const checkPythonEnv = useSettingsStore((s) => s.checkPythonEnv);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const settings = useSettingsStore((s) => s.settings);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Initial Environment Check & Settings Load
  useEffect(() => {
    checkPythonEnv();
    loadSettings();

    // Check for crash recovery
    if (window.manimStudio) {
      window.manimStudio.checkRecovery().then((recovery) => {
        if (recovery.hasRecovery && recovery.recoveryContent) {
          try {
            const parsed = JSON.parse(recovery.recoveryContent);
            const restore = window.confirm(
              'A crash recovery backup was found from a previous session. Would you like to restore it?'
            );
            if (restore) {
              loadProject(parsed);
            } else {
              window.manimStudio.discardRecovery();
            }
          } catch (e) {
            console.error('Failed to parse recovery project:', e);
          }
        }
      });
    }
  }, []);

  // 2. Wire up IPC event streams
  useEffect(() => {
    if (!window.manimStudio) return;

    const unsubLog = window.manimStudio.onRenderLog((event) => {
      appendLog(event);
    });

    const unsubProgress = window.manimStudio.onRenderProgress((event) => {
      setProgress(event.percentage, event.message);
    });

    const unsubComplete = window.manimStudio.onRenderComplete((event) => {
      setComplete(event.success, event.videoUrl, event.error);
    });

    return () => {
      unsubLog();
      unsubProgress();
      unsubComplete();
    };
  }, [appendLog, setProgress, setComplete]);

  // 3. Live debounced graph compilation
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      const isLatexReady = !!pythonEnv?.latex?.found;
      const result = compileGraphToPython(nodes, edges, isLatexReady);
      setCompileResult(result);
    }, 50);

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [nodes, edges, pythonEnv, setCompileResult]);

  // 4. Periodic Autosave
  useEffect(() => {
    const intervalSec = settings?.autoSaveIntervalSeconds || 30;
    const interval = setInterval(() => {
      if (isDirty && window.manimStudio) {
        const project = getProjectFile();
        window.manimStudio.autosaveProject(JSON.stringify(project));
      }
    }, intervalSec * 1000);

    return () => clearInterval(interval);
  }, [isDirty, settings, getProjectFile]);

  // 5. Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) {
          redo();
        } else {
          undo();
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        redo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (window.manimStudio) {
          const project = getProjectFile();
          const json = JSON.stringify(project, null, 2);
          window.manimStudio.saveProject(json, filePath).then((res) => {
            if (res.success && res.filePath) {
              loadProject(project, res.filePath);
            }
          });
        }
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        // Trigger fast preview render
        if (window.manimStudio && compileResult) {
          const renderId = `render_${Date.now()}`;
          startRender(renderId);
          window.manimStudio.startRender({
            renderId,
            sceneCode: compileResult.pythonCode,
            sceneClassName: compileResult.sceneClassName,
            quality: 'low',
            format: format
          });
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, filePath, getProjectFile, loadProject, compileResult, startRender, format]);

  return (
    <div className="h-screen w-screen flex flex-col bg-dark-900 text-slate-100 overflow-hidden font-sans">
      <TopBar />

      <div className="flex-1 flex min-h-0 overflow-hidden">
        <NodePalette />
        <div className="flex-1 h-full min-w-0">
          <NodeCanvas />
        </div>
        <RightPanel />
      </div>

      <VideoPreviewArea />

      {/* Modals */}
      <EnvironmentSetupModal />
      <SettingsModal />
      <ExamplesModal />
    </div>
  );
};
