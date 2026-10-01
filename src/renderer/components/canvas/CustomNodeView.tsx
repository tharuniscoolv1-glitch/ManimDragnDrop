import React, { memo } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import { useGraphStore } from '../../store/graph-store';
import { getNodeDefinition, CATEGORY_COLORS } from '../../core/node-registry';
import { PORT_COLORS } from '../../core/port-types';
import type { GraphNodeData } from '@shared/graph-types';
import type { DataType } from '@shared/node-types';
import { AlertCircle, AlertTriangle, Trash2 } from 'lucide-react';

export const CustomNodeView: React.FC<NodeProps> = memo(({ id, data, selected }) => {
  const nodeData = data as unknown as GraphNodeData;
  const def = getNodeDefinition(nodeData.definitionId);
  const removeNode = useGraphStore((s) => s.removeNode);
  const updateNodeParam = useGraphStore((s) => s.updateNodeParam);

  if (!def) {
    return (
      <div className="p-3 bg-red-900/60 border border-red-500 rounded text-xs text-white">
        Unknown Node ({nodeData.definitionId})
      </div>
    );
  }

  const categoryColor = CATEGORY_COLORS[def.category] || '#64748b';
  const hasError = !!nodeData.error;
  const hasWarning = !!nodeData.warning;

  // Primary inline parameter if available (for quick adjustments directly on the node)
  const primaryParam = def.params[0];

  return (
    <div
      className={`min-w-[200px] max-w-[260px] rounded-lg shadow-xl border bg-dark-850 text-slate-200 transition-all ${
        hasError
          ? 'border-red-500 ring-2 ring-red-500/50 shadow-red-950/50'
          : hasWarning
          ? 'border-amber-500 ring-1 ring-amber-500/30'
          : selected
          ? 'border-blue-400 ring-2 ring-blue-500/50 shadow-blue-950/50'
          : 'border-dark-700 hover:border-dark-600'
      }`}
    >
      {/* Node Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-dark-700 bg-dark-800 rounded-t-lg">
        <div className="flex items-center space-x-2 overflow-hidden">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: categoryColor }}
          />
          <span className="font-semibold text-xs tracking-wide truncate text-slate-100" title={def.label}>
            {nodeData.customLabel || def.label}
          </span>
        </div>

        <div className="flex items-center space-x-1.5 flex-shrink-0">
          {hasError && (
            <span title={nodeData.error} className="text-red-400 hover:text-red-300">
              <AlertCircle size={14} />
            </span>
          )}
          {hasWarning && !hasError && (
            <span title={nodeData.warning} className="text-amber-400 hover:text-amber-300">
              <AlertTriangle size={14} />
            </span>
          )}
          {def.id !== 'scene.root' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNode(id);
              }}
              title="Delete node"
              className="text-slate-400 hover:text-red-400 transition-colors p-0.5 rounded cursor-pointer"
            >
              <Trash2 size={12} />
            </button>
          )}
        </div>
      </div>

      {/* Ports Area */}
      <div className="p-2 space-y-2 text-xs">
        {/* Input Handles */}
        <div className="space-y-1.5">
          {def.inputs.map((port) => {
            const portColor = PORT_COLORS[port.type as DataType] || '#94a3b8';
            return (
              <div key={port.id} className="relative flex items-center h-5">
                <Handle
                  type="target"
                  position={Position.Left}
                  id={port.id}
                  style={{
                    backgroundColor: portColor,
                    left: -9,
                    borderColor: '#0d1117'
                  }}
                  title={`${port.name} (${port.type})`}
                />
                <span className="ml-1 text-[11px] font-medium text-slate-300 truncate" title={port.description}>
                  {port.name}
                  {port.required && <span className="text-red-400 ml-0.5">*</span>}
                </span>
                <span
                  className="ml-auto text-[9px] px-1 py-0.2 rounded font-mono"
                  style={{ color: portColor }}
                >
                  {port.type}
                </span>
              </div>
            );
          })}
        </div>

        {/* Quick Inline Param (if single primary param) */}
        {primaryParam && (
          <div className="pt-1 border-t border-dark-700/60 my-1">
            <div className="flex items-center justify-between text-[11px] text-slate-400 mb-0.5">
              <span>{primaryParam.label}:</span>
              {primaryParam.type === 'color' ? (
                <input
                  type="color"
                  value={nodeData.params[primaryParam.id] ?? primaryParam.default}
                  onChange={(e) => updateNodeParam(id, primaryParam.id, e.target.value)}
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-5 h-5 rounded cursor-pointer border-0 bg-transparent nodrag nopan"
                />
              ) : primaryParam.type === 'number' ? (
                <input
                  type="text"
                  inputMode="decimal"
                  value={nodeData.params[primaryParam.id] !== undefined ? nodeData.params[primaryParam.id] : primaryParam.default}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === '' || val === '-' || val === '.' || val === '-.') {
                      updateNodeParam(id, primaryParam.id, val);
                    } else {
                      const num = parseFloat(val);
                      updateNodeParam(id, primaryParam.id, isNaN(num) ? val : num);
                    }
                  }}
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-16 px-1.5 py-0.5 bg-dark-900 border border-dark-700 rounded text-right text-slate-200 focus:outline-none focus:border-blue-500 font-mono text-[11px] nodrag nopan nowheel"
                />
              ) : primaryParam.type === 'string' ? (
                <input
                  type="text"
                  value={nodeData.params[primaryParam.id] ?? primaryParam.default}
                  onChange={(e) => updateNodeParam(id, primaryParam.id, e.target.value)}
                  onPointerDown={(e) => e.stopPropagation()}
                  onMouseDown={(e) => e.stopPropagation()}
                  className="w-24 px-1.5 py-0.5 bg-dark-900 border border-dark-700 rounded text-slate-200 focus:outline-none focus:border-blue-500 text-[11px] truncate nodrag nopan"
                />
              ) : null}
            </div>
          </div>
        )}

        {/* Output Handles */}
        <div className="space-y-1.5 pt-1">
          {def.outputs.map((port) => {
            const portColor = PORT_COLORS[port.type as DataType] || '#94a3b8';
            return (
              <div key={port.id} className="relative flex items-center justify-end h-5">
                <span
                  className="mr-auto text-[9px] px-1 py-0.2 rounded font-mono"
                  style={{ color: portColor }}
                >
                  {port.type}
                </span>
                <span className="mr-1 text-[11px] font-medium text-slate-300 truncate" title={port.description}>
                  {port.name}
                </span>
                <Handle
                  type="source"
                  position={Position.Right}
                  id={port.id}
                  style={{
                    backgroundColor: portColor,
                    right: -9,
                    borderColor: '#0d1117'
                  }}
                  title={`${port.name} (${port.type})`}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Error or Warning tooltip footer banner if issue exists */}
      {(hasError || hasWarning) && (
        <div
          className={`px-2 py-1 rounded-b-lg text-[10px] truncate ${
            hasError ? 'bg-red-950/80 text-red-300' : 'bg-amber-950/80 text-amber-300'
          }`}
          title={nodeData.error || nodeData.warning}
        >
          {nodeData.error || nodeData.warning}
        </div>
      )}
    </div>
  );
});

CustomNodeView.displayName = 'CustomNodeView';
