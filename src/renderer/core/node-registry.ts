import type { NodeDefinition, NodeCategory } from '@shared/node-types';
import { sceneRootNode } from './nodes/scene/scene-root';
import { mobjectNodes } from './nodes/mobjects';
import { animationNodes } from './nodes/animations';
import { compositionNodes } from './nodes/composition';
import { modifierNodes } from './nodes/modifiers';
import { valueNodes } from './nodes/values';
import { cameraNodes } from './nodes/camera';

const ALL_NODES: NodeDefinition[] = [
  sceneRootNode,
  ...mobjectNodes,
  ...animationNodes,
  ...compositionNodes,
  ...modifierNodes,
  ...valueNodes,
  ...cameraNodes
];

const NODE_MAP = new Map<string, NodeDefinition>();
ALL_NODES.forEach((node) => {
  NODE_MAP.set(node.id, node);
});

export const CATEGORY_LABELS: Record<NodeCategory, string> = {
  scene: 'Scene & Output',
  mobjects: '2D / 3D Mobjects',
  animations: 'Animations',
  composition: 'Composition & Flow',
  modifiers: 'Transform & Modifiers',
  values: 'Values & Math',
  camera: 'Camera Controls'
};

export const CATEGORY_COLORS: Record<NodeCategory, string> = {
  scene: '#eab308',
  mobjects: '#10b981',
  animations: '#8b5cf6',
  composition: '#3b82f6',
  modifiers: '#ec4899',
  values: '#06b6d4',
  camera: '#f97316'
};

export function getAllNodeDefinitions(): NodeDefinition[] {
  return ALL_NODES;
}

export function getNodeDefinition(id: string): NodeDefinition | undefined {
  return NODE_MAP.get(id);
}

export function getNodesByCategory(cat: NodeCategory): NodeDefinition[] {
  return ALL_NODES.filter((n) => n.category === cat);
}
