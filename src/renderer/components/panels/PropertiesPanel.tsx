import React from 'react';
import { useGraphStore } from '../../store/graph-store';
import { useSettingsStore } from '../../store/settings-store';
import { getNodeDefinition, CATEGORY_LABELS, CATEGORY_COLORS } from '../../core/node-registry';
import { PORT_COLORS } from '../../core/port-types';
import type { DataType } from '@shared/node-types';
import { Trash2, AlertTriangle, Info } from 'lucide-react';

const COLOR_PRESETS = [
  '#ffffff', '#000000', '#3b82f6', '#ef4444',
  '#10b981', '#eab308', '#f97316', '#a855f7', '#ec4899'
];

export const PropertiesPanel: React.FC = () => {
  const selectedNodeId = useGraphStore((s) => s.selectedNodeId);
  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const updateNodeParam = useGraphStore((s) => s.updateNodeParam);
  const updateNodeLabel = useGraphStore((s) => s.updateNodeLabel);
  const removeNode = useGraphStore((s) => s.removeNode);
  const pythonEnv = useSettingsStore((s) => s.pythonEnv);

  const node = nodes.find((n) => n.id === selectedNodeId);
  if (!node) {
    return (
      <div className="h-full flex flex-col items-center justify-center p-6 text-center text-slate-400">
        <Info size={32} className="mb-2 text-slate-400" />
        <p className="text-sm font-medium text-slate-300">No Node Selected</p>
        <p className="text-xs mt-1 text-slate-400">Click a node on the canvas to configure its properties.</p>
      </div>
    );
  }

  const def = getNodeDefinition(node.data.definitionId);
  if (!def) {
    return <div className="p-4 text-xs text-red-400">Unknown node definition</div>;
  }

  const catColor = CATEGORY_COLORS[def.category] || '#3b82f6';
  const isLatexMissing = def.requiresLatex && !pythonEnv?.latex?.found;

  const connectedInputPorts = new Set(
    edges.filter((e) => e.target === node.id).map((e) => e.targetHandle)
  );

  return (
    <div className="h-full flex flex-col overflow-y-auto p-4 space-y-4 text-xs select-none">
      {/* Node Header */}
      <div className="flex items-center justify-between pb-3 border-b border-dark-700">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: catColor }} />
            <span className="font-bold text-sm text-white">{def.label}</span>
          </div>
          <p className="text-[10px] text-slate-400 font-mono">{CATEGORY_LABELS[def.category]}</p>
        </div>

        {def.id !== 'scene.root' && (
          <button
            onClick={() => removeNode(node.id)}
            className="flex items-center space-x-1 px-2 py-1 text-red-400 hover:bg-red-950/40 rounded transition-colors border border-red-900/50 cursor-pointer"
            title="Delete this node"
          >
            <Trash2 size={13} />
            <span>Delete</span>
          </button>
        )}
      </div>

      {/* LaTeX Warning */}
      {isLatexMissing && (
        <div className="p-2.5 bg-amber-950/50 border border-amber-500/50 rounded-lg text-amber-200 text-xs flex items-start space-x-2">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-amber-300">LaTeX Not Detected</p>
            <p className="text-[11px] mt-0.5 text-amber-200/90 leading-relaxed">
              This node requires LaTeX (MiKTeX or TeXLive) to render formulas. For plain text without LaTeX, use the standard <strong>Text</strong> node.
            </p>
          </div>
        </div>
      )}

      {/* Description */}
      <p className="text-slate-400 leading-relaxed italic bg-dark-800/40 p-2 rounded border border-dark-700/50">
        {def.description}
      </p>

      {/* Custom Label */}
      <div className="space-y-1">
        <label className="text-[11px] font-semibold text-slate-300">Custom Label (Optional)</label>
        <input
          type="text"
          value={node.data.customLabel || ''}
          onChange={(e) => updateNodeLabel(node.id, e.target.value)}
          placeholder={def.label}
          className="w-full px-2.5 py-1.5 bg-dark-900 border border-dark-700 rounded text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
        />
      </div>

      {/* Parameters */}
      {def.params.length > 0 && (
        <div className="space-y-3 pt-2">
          <h4 className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider">
            Parameters
          </h4>

          {def.params.map((param) => {
            const val = node.data.params[param.id] ?? param.default;
            const isOverriddenByInput = connectedInputPorts.has(param.id);

            return (
              <div key={param.id} className="space-y-1 bg-dark-800/50 p-2.5 rounded border border-dark-700">
                <div className="flex items-center justify-between">
                  <label className="font-medium text-slate-300 text-[11px]">
                    {param.label}
                  </label>
                  {isOverriddenByInput && (
                    <span className="text-[10px] text-blue-400 font-mono">
                      (Connected from input)
                    </span>
                  )}
                </div>

                {param.type === 'number' && (
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={param.min}
                      max={param.max}
                      step={param.step || 0.1}
                      value={val ?? 0}
                      onChange={(e) => updateNodeParam(node.id, param.id, parseFloat(e.target.value) || 0)}
                      className="w-full px-2.5 py-1 bg-dark-900 border border-dark-700 rounded text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs"
                    />
                  </div>
                )}

                {param.type === 'string' && (
                  <input
                    type="text"
                    value={val ?? ''}
                    onChange={(e) => updateNodeParam(node.id, param.id, e.target.value)}
                    className="w-full px-2.5 py-1 bg-dark-900 border border-dark-700 rounded text-slate-200 focus:outline-none focus:border-blue-500 text-xs"
                  />
                )}

                {param.type === 'text' && (
                  <textarea
                    rows={3}
                    value={val ?? ''}
                    onChange={(e) => updateNodeParam(node.id, param.id, e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-dark-900 border border-dark-700 rounded text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-xs resize-y"
                  />
                )}

                {param.type === 'color' && (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        value={val || '#ffffff'}
                        onChange={(e) => updateNodeParam(node.id, param.id, e.target.value)}
                        className="w-8 h-8 rounded border-0 cursor-pointer bg-transparent"
                      />
                      <input
                        type="text"
                        value={val || '#ffffff'}
                        onChange={(e) => updateNodeParam(node.id, param.id, e.target.value)}
                        className="flex-1 px-2.5 py-1 bg-dark-900 border border-dark-700 rounded text-slate-200 font-mono uppercase text-xs"
                      />
                    </div>
                    {/* Quick presets */}
                    <div className="flex items-center space-x-1">
                      {COLOR_PRESETS.map((hex) => (
                        <button
                          key={hex}
                          onClick={() => updateNodeParam(node.id, param.id, hex)}
                          style={{ backgroundColor: hex }}
                          className={`w-4 h-4 rounded-full border border-slate-600 hover:scale-125 transition-transform ${
                            val === hex ? 'ring-2 ring-blue-400' : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {param.type === 'vector3' && (
                  <div className="grid grid-cols-3 gap-1.5">
                    {(['X', 'Y', 'Z'] as const).map((axis, i) => {
                      const currentVec = Array.isArray(val) ? val : [0, 0, 0];
                      return (
                        <div key={axis} className="flex items-center space-x-1 bg-dark-900 px-1.5 py-0.5 rounded border border-dark-700">
                          <span className="text-[10px] text-slate-400 font-mono">{axis}:</span>
                          <input
                            type="number"
                            step={0.1}
                            value={currentVec[i] ?? 0}
                            onChange={(e) => {
                              const next = [...currentVec];
                              next[i] = parseFloat(e.target.value) || 0;
                              updateNodeParam(node.id, param.id, next);
                            }}
                            className="w-full bg-transparent text-right font-mono text-xs text-slate-200 focus:outline-none"
                          />
                        </div>
                      );
                    })}
                  </div>
                )}

                {param.type === 'boolean' && (
                  <label className="flex items-center space-x-2 cursor-pointer mt-1">
                    <input
                      type="checkbox"
                      checked={!!val}
                      onChange={(e) => updateNodeParam(node.id, param.id, e.target.checked)}
                      className="w-4 h-4 rounded border-dark-700 text-blue-600 focus:ring-0 bg-dark-900 cursor-pointer"
                    />
                    <span className="text-slate-300 text-xs">Enabled</span>
                  </label>
                )}

                {param.type === 'select' && (
                  <select
                    value={val}
                    onChange={(e) => updateNodeParam(node.id, param.id, e.target.value)}
                    className="w-full px-2.5 py-1 bg-dark-900 border border-dark-700 rounded text-slate-200 focus:outline-none focus:border-blue-500 text-xs cursor-pointer"
                  >
                    {param.options?.map((opt) => (
                      <option key={String(opt.value)} value={String(opt.value)}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}

                {param.description && (
                  <p className="text-[10px] text-slate-400 mt-1">{param.description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Ports Overview */}
      <div className="pt-2 border-t border-dark-700 space-y-2">
        <h4 className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider">
          Port Connections
        </h4>
        <div className="space-y-1">
          {def.inputs.map((p) => {
            const isConnected = connectedInputPorts.has(p.id);
            const pColor = PORT_COLORS[p.type as DataType] || '#94a3b8';
            return (
              <div key={p.id} className="flex items-center justify-between text-[11px] px-2 py-1 bg-dark-800/40 rounded">
                <span className="text-slate-300">{p.name} (Input)</span>
                <span className="font-mono text-[10px]" style={{ color: pColor }}>
                  {isConnected ? '✓ Connected' : p.required ? 'Required' : 'Optional'}
                </span>
              </div>
            );
          })}
          {def.outputs.map((p) => {
            const isConnected = edges.some((e) => e.source === node.id && e.sourceHandle === p.id);
            const pColor = PORT_COLORS[p.type as DataType] || '#94a3b8';
            return (
              <div key={p.id} className="flex items-center justify-between text-[11px] px-2 py-1 bg-dark-800/40 rounded">
                <span className="text-slate-300">{p.name} (Output)</span>
                <span className="font-mono text-[10px]" style={{ color: pColor }}>
                  {isConnected ? '✓ Connected' : 'Unused'}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
