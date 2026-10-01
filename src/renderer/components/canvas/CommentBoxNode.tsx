import React, { memo } from 'react';
import { NodeProps, NodeResizer } from '@xyflow/react';

export const CommentBoxNode: React.FC<NodeProps> = memo(({ data, selected }) => {
  const label = (data?.label as string) || 'Comment Box';

  return (
    <div
      className={`rounded-lg border-2 border-dashed p-3 min-w-[200px] min-h-[150px] bg-dark-800/30 transition-all ${
        selected ? 'border-blue-400 bg-blue-950/10' : 'border-dark-600'
      }`}
    >
      <NodeResizer minWidth={150} minHeight={100} isVisible={selected} />
      <div className="text-xs font-semibold text-slate-400 select-none uppercase tracking-wider mb-2">
        {label}
      </div>
    </div>
  );
});

CommentBoxNode.displayName = 'CommentBoxNode';
