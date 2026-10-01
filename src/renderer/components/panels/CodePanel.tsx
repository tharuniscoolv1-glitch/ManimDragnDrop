import React, { useState } from 'react';
import Editor from '@monaco-editor/react';
import { useGraphStore } from '../../store/graph-store';
import { Copy, Check, Download, AlertCircle, AlertTriangle } from 'lucide-react';

export const CodePanel: React.FC = () => {
  const compileResult = useGraphStore((s) => s.compileResult);
  const setSelectedNodeId = useGraphStore((s) => s.setSelectedNodeId);
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const pythonCode = compileResult?.pythonCode || '# Live Python code will generate here...';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(pythonCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const handleExport = async () => {
    if (!window.manimStudio || !compileResult) return;
    setExporting(true);
    try {
      await window.manimStudio.exportPython(pythonCode, `${compileResult.sceneClassName}.py`);
    } finally {
      setExporting(false);
    }
  };

  const errors = compileResult?.errors || [];
  const warnings = compileResult?.warnings || [];

  return (
    <div className="h-full flex flex-col bg-dark-900 select-none">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-dark-700 bg-dark-800">
        <div className="flex items-center space-x-3 text-xs">
          <span className="font-semibold text-slate-200">Generated Python</span>
          {errors.length > 0 ? (
            <span className="flex items-center text-red-400 font-mono text-[11px] bg-red-950/60 px-2 py-0.5 rounded border border-red-900/60">
              <AlertCircle size={12} className="mr-1" />
              {errors.length} {errors.length === 1 ? 'Error' : 'Errors'}
            </span>
          ) : warnings.length > 0 ? (
            <span className="flex items-center text-amber-400 font-mono text-[11px] bg-amber-950/60 px-2 py-0.5 rounded border border-amber-900/60">
              <AlertTriangle size={12} className="mr-1" />
              {warnings.length} {warnings.length === 1 ? 'Warning' : 'Warnings'}
            </span>
          ) : (
            <span className="text-emerald-400 font-mono text-[11px] bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-900/60">
              ✓ Valid
            </span>
          )}
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={handleCopy}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs bg-dark-700 hover:bg-dark-600 text-slate-200 rounded transition-colors cursor-pointer"
            title="Copy code to clipboard"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs bg-blue-600/80 hover:bg-blue-600 text-white rounded transition-colors cursor-pointer"
            title="Export as standalone .py script"
          >
            <Download size={13} />
            <span>Export .py</span>
          </button>
        </div>
      </div>

      {/* Issues List (if any exist, clickable to select node) */}
      {(errors.length > 0 || warnings.length > 0) && (
        <div className="max-h-28 overflow-y-auto bg-dark-850 border-b border-dark-700 p-2 space-y-1 text-xs">
          {errors.map((err, i) => (
            <div
              key={`err_${i}`}
              onClick={() => err.nodeId && setSelectedNodeId(err.nodeId)}
              className={`flex items-start space-x-2 px-2 py-1 rounded transition-colors ${
                err.nodeId ? 'hover:bg-red-950/60 cursor-pointer' : ''
              } text-red-300 text-[11px]`}
            >
              <AlertCircle size={13} className="text-red-400 flex-shrink-0 mt-0.5" />
              <span>{err.message}</span>
            </div>
          ))}
          {warnings.map((warn, i) => (
            <div
              key={`warn_${i}`}
              onClick={() => warn.nodeId && setSelectedNodeId(warn.nodeId)}
              className={`flex items-start space-x-2 px-2 py-1 rounded transition-colors ${
                warn.nodeId ? 'hover:bg-amber-950/60 cursor-pointer' : ''
              } text-amber-300 text-[11px]`}
            >
              <AlertTriangle size={13} className="text-amber-400 flex-shrink-0 mt-0.5" />
              <span>{warn.message}</span>
            </div>
          ))}
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1 w-full min-h-0">
        <Editor
          height="100%"
          language="python"
          theme="vs-dark"
          value={pythonCode}
          options={{
            readOnly: true,
            minimap: { enabled: false },
            fontSize: 12,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            wordWrap: 'on',
            automaticLayout: true,
            tabSize: 4
          }}
        />
      </div>
    </div>
  );
};
