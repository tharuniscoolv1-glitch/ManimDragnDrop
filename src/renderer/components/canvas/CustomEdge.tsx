import React from 'react';
import { BaseEdge, EdgeProps, getBezierPath } from '@xyflow/react';
import { useGraphStore } from '../../store/graph-store';
import { getNodeDefinition } from '../../core/node-registry';
import { PORT_COLORS } from '../../core/port-types';
import type { DataType } from '@shared/node-types';

export const CustomEdge: React.FC<EdgeProps> = ({
  id,
  source,
  sourceHandleId,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  selected
}) => {
  const nodes = useGraphStore((s) => s.nodes);
  const onEdgesChange = useGraphStore((s) => s.onEdgesChange);

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition
  });

  // Determine edge color based on source port type
  let strokeColor = '#8b5cf6'; // default purple
  const sourceNode = nodes.find((n) => n.id === source);
  if (sourceNode) {
    const def = getNodeDefinition(sourceNode.data.definitionId);
    if (def) {
      const port = def.outputs.find((p) => p.id === sourceHandleId);
      if (port && PORT_COLORS[port.type as DataType]) {
        strokeColor = PORT_COLORS[port.type as DataType];
      }
    }
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdgesChange([{ id, type: 'remove' }]);
  };

  return (
    <>
      <BaseEdge
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          ...style,
          stroke: strokeColor,
          strokeWidth: selected ? 3.5 : 2.5,
          filter: selected ? `drop-shadow(0 0 6px ${strokeColor})` : undefined
        }}
      />
      {selected && (
        <foreignObject
          width={24}
          height={24}
          x={labelX - 12}
          y={labelY - 12}
          className="overflow-visible"
          requiredExtensions="http://www.w3.org/1999/xhtml"
        >
          <button
            onClick={handleDelete}
            title="Delete Connection"
            className="w-6 h-6 rounded-full bg-red-600 hover:bg-red-500 text-white flex items-center justify-center text-xs font-bold shadow-lg transition-transform hover:scale-110 cursor-pointer"
          >
            ×
          </button>
        </foreignObject>
      )}
    </>
  );
};
