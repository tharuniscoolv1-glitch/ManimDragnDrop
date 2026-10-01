import React, { useState, useEffect, useRef } from 'react';
import { useRenderStore } from '../../store/render-store';
import { Trash2, Terminal, ArrowDown } from 'lucide-react';

export const LogPanel: React.FC = () => {
  const logs = useRenderStore((s) => s.logs);
  const clearLogs = useRenderStore((s) => s.clearLogs);
  const [filter, setFilter] = useState<'all' | 'stdout' | 'stderr'>('all');
  const [autoScroll, setAutoScroll] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const filteredLogs = logs.filter((log) => {
    if (filter === 'stdout') return log.stream === 'stdout';
    if (filter === 'stderr') return log.stream === 'stderr';
    return true;
  });

  return (
    <div className="h-full flex flex-col bg-dark-900 select-none">
      {/* Log Header Controls */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-dark-700 bg-dark-800 text-xs">
        <div className="flex items-center space-x-2">
          <Terminal size={14} className="text-slate-400" />
          <span className="font-semibold text-slate-200">Execution Output</span>
          <span className="text-[10px] text-slate-400 font-mono">({logs.length} entries)</span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Stream filter */}
          <div className="flex rounded border border-dark-700 overflow-hidden text-[10px]">
            <button
              onClick={() => setFilter('all')}
              className={`px-2 py-0.5 ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-dark-850 text-slate-300 hover:bg-dark-700'}`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('stdout')}
              className={`px-2 py-0.5 ${filter === 'stdout' ? 'bg-blue-600 text-white' : 'bg-dark-850 text-slate-300 hover:bg-dark-700'}`}
            >
              Stdout
            </button>
            <button
              onClick={() => setFilter('stderr')}
              className={`px-2 py-0.5 ${filter === 'stderr' ? 'bg-blue-600 text-white' : 'bg-dark-850 text-slate-300 hover:bg-dark-700'}`}
            >
              Stderr
            </button>
          </div>

          {/* Auto-scroll toggle */}
          <button
            onClick={() => setAutoScroll(!autoScroll)}
            className={`p-1 rounded transition-colors ${autoScroll ? 'text-blue-400 bg-blue-950/40' : 'text-slate-400 hover:bg-dark-700'}`}
            title={autoScroll ? 'Auto-scroll enabled' : 'Auto-scroll paused'}
          >
            <ArrowDown size={13} />
          </button>

          {/* Clear button */}
          <button
            onClick={clearLogs}
            className="p-1 text-slate-400 hover:text-red-400 hover:bg-dark-700 rounded transition-colors"
            title="Clear console output"
          >
            <Trash2 size={13} />
          </button>
        </div>
      </div>

      {/* Terminal Output */}
      <div
        ref={scrollRef}
        className="flex-1 p-3 overflow-y-auto font-mono text-[11px] leading-relaxed text-slate-300 space-y-1 bg-dark-900 select-text"
      >
        {filteredLogs.length === 0 ? (
          <div className="text-slate-400 select-none pt-4 text-center">
            No execution logs yet. Click Preview or Render to see Manim subprocess output.
          </div>
        ) : (
          filteredLogs.map((log, idx) => (
            <div
              key={idx}
              className={`whitespace-pre-wrap break-all ${
                log.stream === 'stderr' ? 'text-red-300/90' : 'text-slate-200'
              }`}
            >
              {log.text}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
