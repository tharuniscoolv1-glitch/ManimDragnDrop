import type { GraphNode, GraphEdge } from '@shared/graph-types';
import type { CompileResult, CompileIssue } from '@shared/compiler-types';
import type { CodegenContext, CodegenOutput } from '@shared/node-types';
import { getNodeDefinition } from '../node-registry';
import { detectCycles, topologicalSort } from './topological-sort';
import { validateGraph } from './validator';

export function compileGraphToPython(
  nodes: GraphNode[],
  edges: GraphEdge[],
  isLatexAvailable: boolean = true
): CompileResult {
  const allErrors: CompileIssue[] = [];
  const allWarnings: CompileIssue[] = [];
  const activeMobjects: string[] = [];

  // 1. Cycle detection
  const cycleResult = detectCycles(nodes, edges);
  if (cycleResult.hasCycle) {
    allErrors.push(...cycleResult.issues);
  }

  // 2. Validation
  const validation = validateGraph(nodes, edges, isLatexAvailable);
  allErrors.push(...validation.errors);
  allWarnings.push(...validation.warnings);

  // 3. Locate Scene Root
  const rootNode = nodes.find((n) => n.data.definitionId === 'scene.root');
  if (!rootNode) {
    return {
      success: false,
      pythonCode: '# Error: Missing Scene Root node.\n# Drag a "Scene Root" from the Scene palette to begin.',
      sceneClassName: 'GeneratedScene',
      errors: allErrors,
      warnings: allWarnings,
      activeMobjects: []
    };
  }

  const rootDef = getNodeDefinition('scene.root');
  const sceneClassName = (rootNode.data.params.scene_name || 'GeneratedScene').replace(/[^a-zA-Z0-9_]/g, '_');

  // Check if camera movement is used anywhere in the graph
  const hasCameraMove = nodes.some((n) => n.data.definitionId === 'camera.move');
  const baseClassName = hasCameraMove ? 'MovingCameraScene' : 'Scene';

  // 4. Trace the Scene-Flow chain starting from Scene Root
  const flowNodes: GraphNode[] = [];
  let currentFlowId: string | null = rootNode.id;
  const visitedFlow = new Set<string>();

  while (currentFlowId && !visitedFlow.has(currentFlowId)) {
    visitedFlow.add(currentFlowId);
    // Find edge where source is currentFlowId and sourceHandle starts with 'flow'
    const nextEdge = edges.find(
      (e) => e.source === currentFlowId && (e.sourceHandle === 'flow' || e.sourceHandle === 'flow_out')
    );

    if (nextEdge) {
      const targetNode = nodes.find((n) => n.id === nextEdge.target);
      if (targetNode) {
        flowNodes.push(targetNode);
        currentFlowId = targetNode.id;
      } else {
        break;
      }
    } else {
      break;
    }
  }

  // 5. Gather all upstream dependencies required by the active flow nodes
  // For each flow node, inspect all non-flow inputs recursively
  const requiredNodeIds = new Set<string>();
  const collectDependencies = (nodeId: string) => {
    if (requiredNodeIds.has(nodeId)) return;
    requiredNodeIds.add(nodeId);

    const incomingEdges = edges.filter((e) => e.target === nodeId && e.targetHandle !== 'flow_in');
    for (const edge of incomingEdges) {
      collectDependencies(edge.source);
    }
  };

  for (const fn of flowNodes) {
    const incomingEdges = edges.filter((e) => e.target === fn.id && e.targetHandle !== 'flow_in');
    for (const edge of incomingEdges) {
      collectDependencies(edge.source);
    }
  }

  // Always include all Mobjects, Modifiers, Values, and Animations on the canvas
  // so the user immediately sees the Python code update as soon as a node is added or edited
  for (const n of nodes) {
    const def = getNodeDefinition(n.data.definitionId);
    if (def && def.id !== 'scene.root' && def.id !== 'comp.play' && def.id !== 'comp.wait') {
      collectDependencies(n.id);
    }
  }

  // 6. Topological sort of the required non-flow nodes
  const sortedNonFlowIds = topologicalSort(Array.from(requiredNodeIds), edges);

  // 7. Context setup for variable naming and codegen execution
  const varCounters = new Map<string, number>();
  const nodeVariableMap = new Map<string, string>(); // nodeId -> varName

  const allocateVariable = (prefix: string): string => {
    const count = (varCounters.get(prefix) || 0) + 1;
    varCounters.set(prefix, count);
    return `${prefix}_${count}`;
  };

  const declarationLines: string[] = [];
  const actionLines: string[] = [];

  // Scene Root initialization code
  if (rootDef) {
    const rootOut = rootDef.codegen({
      nodeId: rootNode.id,
      params: rootNode.data.params,
      inputVariableNames: {},
      allocateVariable
    });
    if (rootOut.actionCode) {
      actionLines.push(...rootOut.actionCode);
    }
  }

  // Helper to resolve input variable names for a node
  const resolveInputs = (node: GraphNode): Record<string, string> => {
    const inputs: Record<string, string[]> = {};
    const inEdges = edges.filter((e) => e.target === node.id);

    for (const edge of inEdges) {
      const portId = edge.targetHandle || 'in';
      const sourceVar = nodeVariableMap.get(edge.source);
      if (sourceVar) {
        if (!inputs[portId]) inputs[portId] = [];
        inputs[portId].push(sourceVar);
      }
    }

    const result: Record<string, string> = {};
    for (const [portId, list] of Object.entries(inputs)) {
      result[portId] = list.join(', ');
    }
    return result;
  };

  // 8. Generate declarations for all required dependency nodes (values, mobjects, animations)
  for (const nodeId of sortedNonFlowIds) {
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) continue;
    const def = getNodeDefinition(node.data.definitionId);
    if (!def) continue;

    const ctx: CodegenContext = {
      nodeId: node.id,
      params: node.data.params,
      inputVariableNames: resolveInputs(node),
      allocateVariable
    };

    try {
      const output: CodegenOutput = def.codegen(ctx);
      if (output.variableName) {
        nodeVariableMap.set(node.id, output.variableName);
        if (def.category === 'mobjects') {
          activeMobjects.push(output.variableName);
        }
      }
      if (output.declarationCode) {
        declarationLines.push(...output.declarationCode);
      }
      if (output.actionCode) {
        actionLines.push(...output.actionCode);
      }
    } catch (err: any) {
      allErrors.push({
        nodeId: node.id,
        message: `Codegen error in ${def.label}: ${err?.message || 'unknown'}`,
        type: 'error'
      });
    }
  }

  // 9. Generate action lines for the flow nodes in sequential order
  for (const flowNode of flowNodes) {
    const def = getNodeDefinition(flowNode.data.definitionId);
    if (!def) continue;

    const ctx: CodegenContext = {
      nodeId: flowNode.id,
      params: flowNode.data.params,
      inputVariableNames: resolveInputs(flowNode),
      allocateVariable
    };

    try {
      const output: CodegenOutput = def.codegen(ctx);
      if (output.declarationCode) {
        declarationLines.push(...output.declarationCode);
      }
      if (output.actionCode) {
        actionLines.push(...output.actionCode);
      }
    } catch (err: any) {
      allErrors.push({
        nodeId: flowNode.id,
        message: `Flow codegen error in ${def.label}: ${err?.message || 'unknown'}`,
        type: 'error'
      });
    }
  }

  // Find which mobjects are introduced via an intro animation (Create, FadeIn, Write, etc.)
  // Any Mobject declared on canvas that is not animated into the scene should be added via self.add() so it's visible!
  const introAnimatedMobjects = new Set<string>();
  for (const line of actionLines) {
    for (const mob of activeMobjects) {
      const regex = new RegExp(`(?:Create|FadeIn|Write|GrowFromCenter|DrawBorderThenFill|ReplacementTransform)\\([^)]*\\b${mob}\\b`);
      if (regex.test(line)) {
        introAnimatedMobjects.add(mob);
      }
    }
  }

  const staticMobjects = activeMobjects.filter((mob) => !introAnimatedMobjects.has(mob));
  const staticAddLines = staticMobjects.map((mob) => `self.add(${mob})`);

  // Fallback if no actions were generated
  if (actionLines.length === 0) {
    actionLines.push('self.wait(1)');
  }

  // 10. Assemble the complete Python scene file
  const pyCode = [
    '# Generated by Manim Node Studio',
    '# Desktop Node-Graph Editor for Manim Community Edition',
    'from manim import *',
    'import numpy as np',
    '',
    `class ${sceneClassName}(${baseClassName}):`,
    '    def construct(self):'
  ];

  // Indented declaration statements
  if (declarationLines.length > 0) {
    pyCode.push('        # --- Object Declarations ---');
    for (const line of declarationLines) {
      pyCode.push(`        ${line}`);
    }
    pyCode.push('');
  }

  // Static objects addition (so objects on canvas show up without having to animate them)
  if (staticAddLines.length > 0) {
    pyCode.push('        # --- Add Objects to Scene ---');
    for (const line of staticAddLines) {
      pyCode.push(`        ${line}`);
    }
    pyCode.push('');
  }

  // Indented animation action statements
  pyCode.push('        # --- Animation Sequence ---');
  for (const line of actionLines) {
    pyCode.push(`        ${line}`);
  }
  pyCode.push('');

  return {
    success: allErrors.filter((e) => e.type === 'error').length === 0,
    pythonCode: pyCode.join('\n'),
    sceneClassName,
    errors: allErrors,
    warnings: allWarnings,
    activeMobjects
  };
}
