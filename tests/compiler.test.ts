import { describe, it, expect } from 'vitest';
import { compileGraphToPython } from '../src/renderer/core/compiler/code-generator';
import { detectCycles, topologicalSort } from '../src/renderer/core/compiler/topological-sort';
import { validateGraph } from '../src/renderer/core/compiler/validator';
import type { GraphNode, GraphEdge } from '../src/shared/graph-types';

describe('Topological Sort and Cycle Detection', () => {
  it('should detect cycles in graph', () => {
    const nodes: GraphNode[] = [
      { id: '1', position: { x: 0, y: 0 }, data: { definitionId: 'mobject.circle', params: {} } },
      { id: '2', position: { x: 0, y: 0 }, data: { definitionId: 'mod.setcolor', params: {} } }
    ];
    // Edge 1 -> 2 and 2 -> 1
    const edges: GraphEdge[] = [
      { id: 'e1', source: '1', target: '2', sourceHandle: 'out', targetHandle: 'mobject' },
      { id: 'e2', source: '2', target: '1', sourceHandle: 'out', targetHandle: 'radius' }
    ];

    const cycleRes = detectCycles(nodes, edges);
    expect(cycleRes.hasCycle).toBe(true);
    expect(cycleRes.issues.length).toBeGreaterThan(0);
  });

  it('should correctly topologically sort linear dependency DAG', () => {
    const nodes = ['val', 'mob', 'anim', 'play'];
    const edges: GraphEdge[] = [
      { id: 'e1', source: 'val', target: 'mob' },
      { id: 'e2', source: 'mob', target: 'anim' },
      { id: 'e3', source: 'anim', target: 'play' }
    ];

    const sorted = topologicalSort(nodes, edges);
    expect(sorted.indexOf('val')).toBeLessThan(sorted.indexOf('mob'));
    expect(sorted.indexOf('mob')).toBeLessThan(sorted.indexOf('anim'));
    expect(sorted.indexOf('anim')).toBeLessThan(sorted.indexOf('play'));
  });
});

describe('Validation', () => {
  it('should error when Scene Root is missing', () => {
    const nodes: GraphNode[] = [
      { id: '1', position: { x: 0, y: 0 }, data: { definitionId: 'mobject.circle', params: {} } }
    ];
    const validation = validateGraph(nodes, []);
    expect(validation.errors.some((e) => e.message.includes('Missing Scene Root'))).toBe(true);
  });

  it('should reject incompatible port types', () => {
    const nodes: GraphNode[] = [
      { id: 'root', position: { x: 0, y: 0 }, data: { definitionId: 'scene.root', params: {} } },
      { id: 'circle', position: { x: 0, y: 0 }, data: { definitionId: 'mobject.circle', params: {} } },
      { id: 'play', position: { x: 0, y: 0 }, data: { definitionId: 'comp.play', params: {} } }
    ];
    // Connecting Mobject directly to comp.play's flow_in port (Mobject vs Scene-Flow)
    const edges: GraphEdge[] = [
      { id: 'e1', source: 'circle', target: 'play', sourceHandle: 'out', targetHandle: 'flow_in' }
    ];

    const validation = validateGraph(nodes, edges);
    expect(validation.errors.some((e) => e.message.includes('Type mismatch'))).toBe(true);
  });
});

describe('Python Code Generation', () => {
  it('should compile a complete Circle to Square Transform graph', () => {
    const nodes: GraphNode[] = [
      {
        id: 'node_root',
        position: { x: 0, y: 0 },
        data: { definitionId: 'scene.root', params: { scene_name: 'TransformScene', background_color: '#111827' } }
      },
      {
        id: 'node_circle',
        position: { x: 100, y: 0 },
        data: { definitionId: 'mobject.circle', params: { radius: 2.0, color: '#3b82f6', fill_opacity: 0.5 } }
      },
      {
        id: 'node_square',
        position: { x: 100, y: 200 },
        data: { definitionId: 'mobject.square', params: { side_length: 3.0, color: '#ef4444', fill_opacity: 0.5 } }
      },
      {
        id: 'node_create',
        position: { x: 300, y: 0 },
        data: { definitionId: 'anim.create', params: { run_time: 1.0 } }
      },
      {
        id: 'node_transform',
        position: { x: 300, y: 200 },
        data: { definitionId: 'anim.transform', params: { run_time: 1.5 } }
      },
      {
        id: 'node_play_1',
        position: { x: 500, y: 0 },
        data: { definitionId: 'comp.play', params: { run_time: 0 } }
      },
      {
        id: 'node_play_2',
        position: { x: 700, y: 0 },
        data: { definitionId: 'comp.play', params: { run_time: 0 } }
      },
      {
        id: 'node_wait',
        position: { x: 900, y: 0 },
        data: { definitionId: 'comp.wait', params: { duration: 1.0 } }
      }
    ];

    const edges: GraphEdge[] = [
      // Flow connections
      { id: 'f1', source: 'node_root', target: 'node_play_1', sourceHandle: 'flow', targetHandle: 'flow_in' },
      { id: 'f2', source: 'node_play_1', target: 'node_play_2', sourceHandle: 'flow_out', targetHandle: 'flow_in' },
      { id: 'f3', source: 'node_play_2', target: 'node_wait', sourceHandle: 'flow_out', targetHandle: 'flow_in' },

      // Animation & Mobject wiring
      { id: 'w1', source: 'node_circle', target: 'node_create', sourceHandle: 'out', targetHandle: 'mobject' },
      { id: 'w2', source: 'node_create', target: 'node_play_1', sourceHandle: 'out', targetHandle: 'animation' },

      { id: 'w3', source: 'node_circle', target: 'node_transform', sourceHandle: 'out', targetHandle: 'source' },
      { id: 'w4', source: 'node_square', target: 'node_transform', sourceHandle: 'out', targetHandle: 'target' },
      { id: 'w5', source: 'node_transform', target: 'node_play_2', sourceHandle: 'out', targetHandle: 'animation' }
    ];

    const result = compileGraphToPython(nodes, edges);

    expect(result.success).toBe(true);
    expect(result.sceneClassName).toBe('TransformScene');
    expect(result.pythonCode).toContain('class TransformScene(Scene):');
    expect(result.pythonCode).toContain('Circle(radius=2, color="#3b82f6"');
    expect(result.pythonCode).toContain('Square(side_length=3, color="#ef4444"');
    expect(result.pythonCode).toContain('Create(');
    expect(result.pythonCode).toContain('Transform(');
    expect(result.pythonCode).toContain('self.play(');
    expect(result.pythonCode).toContain('self.wait(1)');
  });
});
