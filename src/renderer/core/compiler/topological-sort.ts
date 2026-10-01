import type { GraphNode, GraphEdge } from '@shared/graph-types';
import type { CompileIssue } from '@shared/compiler-types';

export interface DependencyGraph {
  // node -> array of node IDs that this node depends on (inputs come from them)
  incoming: Map<string, string[]>;
  // node -> array of node IDs that depend on this node (outputs go to them)
  outgoing: Map<string, string[]>;
}

export function buildDependencyGraph(nodes: GraphNode[], edges: GraphEdge[]): DependencyGraph {
  const incoming = new Map<string, string[]>();
  const outgoing = new Map<string, string[]>();

  for (const node of nodes) {
    incoming.set(node.id, []);
    outgoing.set(node.id, []);
  }

  for (const edge of edges) {
    if (incoming.has(edge.target) && outgoing.has(edge.source)) {
      incoming.get(edge.target)!.push(edge.source);
      outgoing.get(edge.source)!.push(edge.target);
    }
  }

  return { incoming, outgoing };
}

export function detectCycles(nodes: GraphNode[], edges: GraphEdge[]): { hasCycle: boolean; issues: CompileIssue[] } {
  const issues: CompileIssue[] = [];
  const { outgoing } = buildDependencyGraph(nodes, edges);

  const state = new Map<string, number>(); // 0: unvisited, 1: visiting, 2: visited
  for (const n of nodes) {
    state.set(n.id, 0);
  }

  const path: string[] = [];

  const dfs = (nodeId: string): boolean => {
    state.set(nodeId, 1);
    path.push(nodeId);

    const neighbors = outgoing.get(nodeId) || [];
    for (const next of neighbors) {
      const nextState = state.get(next) ?? 0;
      if (nextState === 1) {
        // Cycle detected
        const cycleStartIndex = path.indexOf(next);
        const cycleNodes = path.slice(cycleStartIndex);
        issues.push({
          nodeId: next,
          message: `Cycle detected involving nodes: ${cycleNodes.join(' -> ')} -> ${next}`,
          type: 'error'
        });
        return true;
      }
      if (nextState === 0) {
        if (dfs(next)) return true;
      }
    }

    path.pop();
    state.set(nodeId, 2);
    return false;
  };

  for (const node of nodes) {
    if ((state.get(node.id) ?? 0) === 0) {
      dfs(node.id);
    }
  }

  return {
    hasCycle: issues.length > 0,
    issues
  };
}

export function topologicalSort(nodeIds: string[], edges: GraphEdge[]): string[] {
  const filteredEdges = edges.filter((e) => nodeIds.includes(e.source) && nodeIds.includes(e.target));
  const inDegree = new Map<string, number>();
  const adj = new Map<string, string[]>();

  for (const id of nodeIds) {
    inDegree.set(id, 0);
    adj.set(id, []);
  }

  for (const edge of filteredEdges) {
    inDegree.set(edge.target, (inDegree.get(edge.target) || 0) + 1);
    adj.get(edge.source)!.push(edge.target);
  }

  const queue: string[] = [];
  for (const [id, deg] of inDegree.entries()) {
    if (deg === 0) {
      queue.push(id);
    }
  }

  const sorted: string[] = [];
  while (queue.length > 0) {
    const cur = queue.shift()!;
    sorted.push(cur);

    for (const next of adj.get(cur) || []) {
      const newDeg = (inDegree.get(next) || 1) - 1;
      inDegree.set(next, newDeg);
      if (newDeg === 0) {
        queue.push(next);
      }
    }
  }

  // Any remaining nodes with degree > 0 are part of a cycle or skipped
  for (const id of nodeIds) {
    if (!sorted.includes(id)) {
      sorted.push(id);
    }
  }

  return sorted;
}
