import type { GraphNode, GraphEdge } from '@shared/graph-types';
import type { CompileIssue } from '@shared/compiler-types';
import { getNodeDefinition } from '../node-registry';
import { arePortsCompatible } from '../port-types';

export function validateGraph(
  nodes: GraphNode[],
  edges: GraphEdge[],
  isLatexAvailable: boolean = true
): { errors: CompileIssue[]; warnings: CompileIssue[] } {
  const errors: CompileIssue[] = [];
  const warnings: CompileIssue[] = [];

  // 1. Check Scene Root
  const rootNodes = nodes.filter((n) => n.data.definitionId === 'scene.root');
  if (rootNodes.length === 0) {
    errors.push({
      message: 'Missing Scene Root node. Add a Scene Root to define the animation sequence.',
      type: 'error'
    });
  } else if (rootNodes.length > 1) {
    warnings.push({
      nodeId: rootNodes[1].id,
      message: 'Multiple Scene Root nodes detected. Only the first one will be compiled.',
      type: 'warning'
    });
  }

  // 2. Validate Edges and Ports
  const targetPortEdgeCount = new Map<string, number>();

  for (const edge of edges) {
    const sourceNode = nodes.find((n) => n.id === edge.source);
    const targetNode = nodes.find((n) => n.id === edge.target);

    if (!sourceNode || !targetNode) continue;

    const sourceDef = getNodeDefinition(sourceNode.data.definitionId);
    const targetDef = getNodeDefinition(targetNode.data.definitionId);

    if (!sourceDef || !targetDef) continue;

    const sourcePort = sourceDef.outputs.find((p) => p.id === edge.sourceHandle);
    const targetPort = targetDef.inputs.find((p) => p.id === edge.targetHandle);

    if (!sourcePort) {
      errors.push({
        nodeId: sourceNode.id,
        message: `Output port "${edge.sourceHandle}" does not exist on ${sourceDef.label}.`,
        type: 'error'
      });
      continue;
    }

    if (!targetPort) {
      errors.push({
        nodeId: targetNode.id,
        message: `Input port "${edge.targetHandle}" does not exist on ${targetDef.label}.`,
        type: 'error'
      });
      continue;
    }

    // Type compatibility check
    if (!arePortsCompatible(sourcePort.type, targetPort.type)) {
      errors.push({
        nodeId: targetNode.id,
        portId: targetPort.id,
        message: `Type mismatch on connection: Port "${sourcePort.name}" (${sourcePort.type}) cannot connect to "${targetPort.name}" (${targetPort.type}).`,
        type: 'error'
      });
    }

    // Multiplicity check for inputs
    const targetKey = `${targetNode.id}:${targetPort.id}`;
    const currentCount = (targetPortEdgeCount.get(targetKey) || 0) + 1;
    targetPortEdgeCount.set(targetKey, currentCount);

    if (currentCount > 1 && !targetPort.allowMultipleConnections) {
      errors.push({
        nodeId: targetNode.id,
        portId: targetPort.id,
        message: `Input port "${targetPort.name}" on ${targetDef.label} only allows a single connection.`,
        type: 'error'
      });
    }
  }

  // 3. Validate Node Requirements and LaTeX
  for (const node of nodes) {
    const def = getNodeDefinition(node.data.definitionId);
    if (!def) {
      errors.push({
        nodeId: node.id,
        message: `Unknown node type: ${node.data.definitionId}`,
        type: 'error'
      });
      continue;
    }

    // Check LaTeX requirement
    if (def.requiresLatex && !isLatexAvailable) {
      warnings.push({
        nodeId: node.id,
        message: `${def.label} requires a local LaTeX installation (e.g. MiKTeX, TeXLive). Rendering may fail if LaTeX is not installed.`,
        type: 'warning'
      });
    }

    // Check required inputs
    for (const reqInput of def.inputs.filter((p) => p.required)) {
      const isConnected = edges.some((e) => e.target === node.id && e.targetHandle === reqInput.id);
      if (!isConnected) {
        // Only warn for play/anim if flow isn't connected or if missing animation
        if (node.data.definitionId === 'comp.play' && reqInput.id === 'animation') {
          warnings.push({
            nodeId: node.id,
            portId: reqInput.id,
            message: `Play node has no Animation connected.`,
            type: 'warning'
          });
        }
      }
    }
  }

  return { errors, warnings };
}
