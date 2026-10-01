import type { RenderQuality } from './ipc-types';

export interface GraphNodeData {
  definitionId: string;
  params: Record<string, any>;
  customLabel?: string;
  error?: string;
  warning?: string;
}

export interface GraphNode {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: GraphNodeData;
  width?: number;
  height?: number;
  selected?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string; // port id on source
  targetHandle?: string; // port id on target
  type?: string;
}

export interface ProjectSettings {
  sceneName: string;
  quality: RenderQuality;
  resolution: [number, number];
  fps: number;
  backgroundColor: string;
  transparent: boolean;
}

export interface ProjectFile {
  schemaVersion: 1;
  name: string;
  createdAt: number;
  updatedAt: number;
  settings: ProjectSettings;
  nodes: GraphNode[];
  edges: GraphEdge[];
  viewport: { x: number; y: number; zoom: number };
}
