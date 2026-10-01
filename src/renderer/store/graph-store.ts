import { create } from 'zustand';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Connection,
  EdgeChange,
  NodeChange
} from '@xyflow/react';
import type { GraphNode, GraphEdge, ProjectFile, ProjectSettings } from '@shared/graph-types';
import type { CompileResult } from '@shared/compiler-types';
import { getNodeDefinition } from '../core/node-registry';
import { arePortsCompatible } from '../core/port-types';

interface HistorySnapshot {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

const MAX_HISTORY = 50;

const defaultSettings: ProjectSettings = {
  sceneName: 'GeneratedScene',
  quality: 'low',
  resolution: [854, 480],
  fps: 15,
  backgroundColor: '#000000',
  transparent: false
};

const createInitialProject = (): { nodes: GraphNode[]; edges: GraphEdge[] } => {
  const rootNode: GraphNode = {
    id: 'node_root',
    type: 'customNode',
    position: { x: 100, y: 150 },
    data: {
      definitionId: 'scene.root',
      params: {
        scene_name: 'MainScene',
        background_color: '#0d1117',
        quality: 'low',
        fps: 30
      }
    }
  };
  return { nodes: [rootNode], edges: [] };
};

export interface GraphState {
  projectName: string;
  filePath?: string;
  isDirty: boolean;
  settings: ProjectSettings;
  nodes: GraphNode[];
  edges: GraphEdge[];
  selectedNodeId: string | null;
  compileResult: CompileResult | null;
  viewport: { x: number; y: number; zoom: number };

  // Undo / Redo history
  past: HistorySnapshot[];
  future: HistorySnapshot[];

  // Actions
  setViewport: (vp: { x: number; y: number; zoom: number }) => void;
  setSelectedNodeId: (id: string | null) => void;
  onNodesChange: (changes: NodeChange<GraphNode>[]) => void;
  onEdgesChange: (changes: EdgeChange<GraphEdge>[]) => void;
  onConnect: (connection: Connection) => boolean;
  addNode: (definitionId: string, position: { x: number; y: number }) => void;
  updateNodeParam: (nodeId: string, paramId: string, value: any) => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  removeNode: (nodeId: string) => void;
  updateSettings: (partial: Partial<ProjectSettings>) => void;
  setCompileResult: (result: CompileResult) => void;

  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  newProject: () => void;
  loadProject: (project: ProjectFile, filePath?: string) => void;
  getProjectFile: () => ProjectFile;
}

export const useGraphStore = create<GraphState>((set, get) => {
  const initial = createInitialProject();

  const takeSnapshot = (state: GraphState): HistorySnapshot => ({
    nodes: JSON.parse(JSON.stringify(state.nodes)),
    edges: JSON.parse(JSON.stringify(state.edges))
  });

  return {
    projectName: 'Untitled Project',
    filePath: undefined,
    isDirty: false,
    settings: { ...defaultSettings },
    nodes: initial.nodes,
    edges: initial.edges,
    selectedNodeId: 'node_root',
    compileResult: null,
    viewport: { x: 0, y: 0, zoom: 1 },
    past: [],
    future: [],

    setViewport: (viewport) => set({ viewport }),

    setSelectedNodeId: (id) => set({ selectedNodeId: id }),

    onNodesChange: (changes) => {
      set((state) => {
        const nextNodes = applyNodeChanges(changes, state.nodes) as GraphNode[];
        return { nodes: nextNodes, isDirty: true };
      });
    },

    onEdgesChange: (changes) => {
      set((state) => {
        // Record undo on edge removal
        const hasRemoval = changes.some((c) => c.type === 'remove');
        const nextEdges = applyEdgeChanges(changes, state.edges) as GraphEdge[];
        if (hasRemoval) {
          return {
            edges: nextEdges,
            isDirty: true,
            past: [...state.past.slice(-MAX_HISTORY + 1), takeSnapshot(state)],
            future: []
          };
        }
        return { edges: nextEdges, isDirty: true };
      });
    },

    onConnect: (connection: Connection) => {
      const state = get();
      if (!connection.source || !connection.target) return false;

      const sourceNode = state.nodes.find((n) => n.id === connection.source);
      const targetNode = state.nodes.find((n) => n.id === connection.target);
      if (!sourceNode || !targetNode) return false;

      const sourceDef = getNodeDefinition(sourceNode.data.definitionId);
      const targetDef = getNodeDefinition(targetNode.data.definitionId);
      if (!sourceDef || !targetDef) return false;

      const sourcePort = sourceDef.outputs.find((p) => p.id === connection.sourceHandle);
      const targetPort = targetDef.inputs.find((p) => p.id === connection.targetHandle);
      if (!sourcePort || !targetPort) return false;

      // Type compatibility
      if (!arePortsCompatible(sourcePort.type, targetPort.type)) {
        return false;
      }

      // Check input multiplicity: if not allowMultipleConnections, remove existing edge to this target port
      let updatedEdges = [...state.edges];
      if (!targetPort.allowMultipleConnections) {
        updatedEdges = updatedEdges.filter(
          (e) => !(e.target === connection.target && e.targetHandle === connection.targetHandle)
        );
      }

      const newEdge: GraphEdge = {
        id: `e_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        source: connection.source,
        target: connection.target,
        sourceHandle: connection.sourceHandle || undefined,
        targetHandle: connection.targetHandle || undefined,
        type: 'customEdge'
      };

      set({
        past: [...state.past.slice(-MAX_HISTORY + 1), takeSnapshot(state)],
        future: [],
        edges: addEdge(newEdge, updatedEdges) as GraphEdge[],
        isDirty: true
      });
      return true;
    },

    addNode: (definitionId: string, position: { x: number; y: number }) => {
      const def = getNodeDefinition(definitionId);
      if (!def) return;

      const state = get();
      const defaultParams: Record<string, any> = {};
      for (const p of def.params) {
        defaultParams[p.id] = p.default;
      }

      const id = `node_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`;
      const newNode: GraphNode = {
        id,
        type: 'customNode',
        position,
        data: {
          definitionId,
          params: defaultParams
        }
      };

      set({
        past: [...state.past.slice(-MAX_HISTORY + 1), takeSnapshot(state)],
        future: [],
        nodes: [...state.nodes, newNode],
        selectedNodeId: id,
        isDirty: true
      });
    },

    updateNodeParam: (nodeId: string, paramId: string, value: any) => {
      const state = get();
      const nextNodes = state.nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              params: {
                ...node.data.params,
                [paramId]: value
              }
            }
          };
        }
        return node;
      });

      set({
        nodes: nextNodes,
        isDirty: true
      });
    },

    updateNodeLabel: (nodeId: string, label: string) => {
      const state = get();
      const nextNodes = state.nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              customLabel: label
            }
          };
        }
        return node;
      });
      set({ nodes: nextNodes, isDirty: true });
    },

    removeNode: (nodeId: string) => {
      const state = get();
      set({
        past: [...state.past.slice(-MAX_HISTORY + 1), takeSnapshot(state)],
        future: [],
        nodes: state.nodes.filter((n) => n.id !== nodeId),
        edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
        selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
        isDirty: true
      });
    },

    updateSettings: (partial) => {
      set((state) => ({
        settings: { ...state.settings, ...partial },
        isDirty: true
      }));
    },

    setCompileResult: (result) => {
      // Annotate nodes with error and warning badges
      const state = get();
      const errorMap = new Map<string, string>();
      const warningMap = new Map<string, string>();

      for (const err of result.errors) {
        if (err.nodeId) errorMap.set(err.nodeId, err.message);
      }
      for (const warn of result.warnings) {
        if (warn.nodeId) warningMap.set(warn.nodeId, warn.message);
      }

      const updatedNodes = state.nodes.map((n) => {
        const error = errorMap.get(n.id);
        const warning = warningMap.get(n.id);
        if (n.data.error !== error || n.data.warning !== warning) {
          return {
            ...n,
            data: {
              ...n.data,
              error,
              warning
            }
          };
        }
        return n;
      });

      set({
        compileResult: result,
        nodes: updatedNodes
      });
    },

    undo: () => {
      const state = get();
      if (state.past.length === 0) return;
      const prev = state.past[state.past.length - 1];
      const newPast = state.past.slice(0, state.past.length - 1);
      const current = takeSnapshot(state);

      set({
        past: newPast,
        future: [current, ...state.future],
        nodes: prev.nodes,
        edges: prev.edges,
        isDirty: true
      });
    },

    redo: () => {
      const state = get();
      if (state.future.length === 0) return;
      const next = state.future[0];
      const newFuture = state.future.slice(1);
      const current = takeSnapshot(state);

      set({
        past: [...state.past, current],
        future: newFuture,
        nodes: next.nodes,
        edges: next.edges,
        isDirty: true
      });
    },

    canUndo: () => get().past.length > 0,
    canRedo: () => get().future.length > 0,

    newProject: () => {
      const initial = createInitialProject();
      set({
        projectName: 'Untitled Project',
        filePath: undefined,
        isDirty: false,
        settings: { ...defaultSettings },
        nodes: initial.nodes,
        edges: initial.edges,
        selectedNodeId: 'node_root',
        compileResult: null,
        viewport: { x: 0, y: 0, zoom: 1 },
        past: [],
        future: []
      });
    },

    loadProject: (project: ProjectFile, filePath?: string) => {
      set({
        projectName: project.name || 'Loaded Project',
        filePath,
        isDirty: false,
        settings: project.settings || { ...defaultSettings },
        nodes: project.nodes || [],
        edges: project.edges || [],
        viewport: project.viewport || { x: 0, y: 0, zoom: 1 },
        selectedNodeId: project.nodes?.[0]?.id || null,
        past: [],
        future: []
      });
    },

    getProjectFile: (): ProjectFile => {
      const state = get();
      return {
        schemaVersion: 1,
        name: state.projectName,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        settings: state.settings,
        nodes: state.nodes,
        edges: state.edges,
        viewport: state.viewport
      };
    }
  };
});
