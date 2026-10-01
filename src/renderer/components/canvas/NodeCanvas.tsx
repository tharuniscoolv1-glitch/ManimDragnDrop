import React, { useState, useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  ReactFlowProvider,
  Node,
  Edge
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useGraphStore } from '../../store/graph-store';
import { CustomNodeView } from './CustomNodeView';
import { CustomEdge } from './CustomEdge';
import { CommentBoxNode } from './CommentBoxNode';
import { QuickAddMenu } from './QuickAddMenu';

const nodeTypes = {
  customNode: CustomNodeView,
  commentBox: CommentBoxNode
};

const edgeTypes = {
  customEdge: CustomEdge
};

const InnerCanvas: React.FC = () => {
  const reactFlowInstance = useReactFlow();
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  const nodes = useGraphStore((s) => s.nodes);
  const edges = useGraphStore((s) => s.edges);
  const onNodesChange = useGraphStore((s) => s.onNodesChange);
  const onEdgesChange = useGraphStore((s) => s.onEdgesChange);
  const onConnect = useGraphStore((s) => s.onConnect);
  const setSelectedNodeId = useGraphStore((s) => s.setSelectedNodeId);
  const addNode = useGraphStore((s) => s.addNode);

  const [quickAdd, setQuickAdd] = useState<{
    screenPos: { x: number; y: number };
    canvasPos: { x: number; y: number };
  } | null>(null);

  // Handle Drag & Drop from Sidebar
  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const definitionId = event.dataTransfer.getData('application/manim-node-id');
      if (!definitionId) return;

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });

      addNode(definitionId, position);
    },
    [reactFlowInstance, addNode]
  );

  // Context menu (Right Click)
  const onContextMenu = useCallback(
    (event: React.MouseEvent) => {
      event.preventDefault();
      const canvasPos = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY
      });
      setQuickAdd({
        screenPos: { x: event.clientX, y: event.clientY },
        canvasPos
      });
    },
    [reactFlowInstance]
  );

  // Spacebar quick-add
  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.code === 'Space' && !quickAdd) {
        // Prevent default scrolling
        e.preventDefault();
        const wrapper = reactFlowWrapper.current?.getBoundingClientRect();
        if (wrapper) {
          const centerX = wrapper.left + wrapper.width / 2;
          const centerY = wrapper.top + wrapper.height / 2;
          const canvasPos = reactFlowInstance.screenToFlowPosition({ x: centerX, y: centerY });
          setQuickAdd({
            screenPos: { x: centerX - 140, y: centerY - 100 },
            canvasPos
          });
        }
      }
    },
    [reactFlowInstance, quickAdd]
  );

  return (
    <div
      ref={reactFlowWrapper}
      className="w-full h-full relative outline-none select-none bg-dark-900"
      onKeyDown={onKeyDown}
      tabIndex={0}
    >
      <ReactFlow
        nodes={nodes as unknown as Node[]}
        edges={edges as unknown as Edge[]}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange as any}
        onEdgesChange={onEdgesChange as any}
        onConnect={onConnect}
        onNodeClick={(_event, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => {
          setSelectedNodeId(null);
          setQuickAdd(null);
        }}
        onDragOver={onDragOver}
        onDrop={onDrop}
        onContextMenu={onContextMenu}
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{ type: 'customEdge' }}
        minZoom={0.2}
        maxZoom={2.5}
        snapToGrid={true}
        snapGrid={[16, 16]}
      >
        <Background variant={BackgroundVariant.Dots} gap={16} size={1.2} color="#21262d" />
        <Controls position="bottom-right" className="!m-4" />
        <MiniMap
          position="bottom-left"
          className="!m-4"
          nodeColor={(n) => {
            if (n.data?.definitionId === 'scene.root') return '#eab308';
            if (n.data?.error) return '#ef4444';
            return '#3b82f6';
          }}
          maskColor="rgba(13, 17, 23, 0.75)"
        />
      </ReactFlow>

      {quickAdd && (
        <QuickAddMenu
          position={quickAdd.screenPos}
          canvasPosition={quickAdd.canvasPos}
          onClose={() => setQuickAdd(null)}
        />
      )}
    </div>
  );
};

export const NodeCanvas: React.FC = () => {
  return (
    <ReactFlowProvider>
      <InnerCanvas />
    </ReactFlowProvider>
  );
};
