import React from 'react';
import { useSettingsStore } from '../../store/settings-store';
import { useGraphStore } from '../../store/graph-store';
import { EXAMPLES } from '../../examples';
import { X, Sparkles, ArrowRight, Tag } from 'lucide-react';

export const ExamplesModal: React.FC = () => {
  const isOpen = useSettingsStore((s) => s.isExamplesModalOpen);
  const setOpen = useSettingsStore((s) => s.setExamplesModalOpen);
  const loadProject = useGraphStore((s) => s.loadProject);

  if (!isOpen) return null;

  const handleSelectExample = (ex: typeof EXAMPLES[0]) => {
    loadProject(ex.project);
    setOpen(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 select-none">
      <div className="w-full max-w-2xl bg-dark-850 border border-dark-700 rounded-xl shadow-2xl flex flex-col overflow-hidden text-slate-200 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-dark-700 bg-dark-800">
          <div className="flex items-center space-x-2.5">
            <Sparkles size={18} className="text-amber-400" />
            <h3 className="font-bold text-sm text-white">Example Manim Projects</h3>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <p className="text-xs text-slate-400">
            Explore these sample node graphs to understand animations, transforms, axes plots, and typography.
          </p>

          <div className="grid grid-cols-1 gap-3 pt-1">
            {EXAMPLES.map((ex) => (
              <div
                key={ex.id}
                className="p-4 bg-dark-900 border border-dark-700 hover:border-dark-600 rounded-lg flex flex-col justify-between space-y-3 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-sm text-slate-100">{ex.title}</h4>
                    <div className="flex items-center space-x-1.5">
                      {ex.tags.map((t) => (
                        <span
                          key={t}
                          className="flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] bg-dark-800 border border-dark-700 text-slate-300 font-medium"
                        >
                          <Tag size={10} className="text-blue-400" />
                          <span>{t}</span>
                        </span>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{ex.description}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-dark-800/80">
                  <span className="text-[11px] text-slate-400 font-mono">
                    {ex.project.nodes.length} Nodes • {ex.project.edges.length} Connections
                  </span>
                  <button
                    onClick={() => handleSelectExample(ex)}
                    className="flex items-center space-x-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <span>Load Project</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-5 py-3 border-t border-dark-700 bg-dark-800">
          <button
            onClick={() => setOpen(false)}
            className="px-4 py-1.5 bg-dark-700 hover:bg-dark-600 text-slate-200 rounded text-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
