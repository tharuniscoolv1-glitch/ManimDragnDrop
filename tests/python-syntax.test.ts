import { describe, it, expect } from 'vitest';
import { compileGraphToPython } from '../src/renderer/core/compiler/code-generator';
import type { GraphNode, GraphEdge } from '../src/shared/graph-types';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execFileSync } from 'child_process';

describe('Python Syntax Compilation Test', () => {
  it('generated code passes python -m py_compile', () => {
    const nodes: GraphNode[] = [
      {
        id: 'root',
        position: { x: 0, y: 0 },
        data: { definitionId: 'scene.root', params: { scene_name: 'TestScene', background_color: '#000000' } }
      },
      {
        id: 'dot',
        position: { x: 100, y: 0 },
        data: { definitionId: 'mobject.dot', params: { point: [0, 0, 0], radius: 0.1, color: '#f43f5e' } }
      },
      {
        id: 'anim',
        position: { x: 300, y: 0 },
        data: { definitionId: 'anim.fadein', params: { run_time: 1.0, shift: 'UP' } }
      },
      {
        id: 'play',
        position: { x: 500, y: 0 },
        data: { definitionId: 'comp.play', params: {} }
      }
    ];

    const edges: GraphEdge[] = [
      { id: 'f1', source: 'root', target: 'play', sourceHandle: 'flow', targetHandle: 'flow_in' },
      { id: 'w1', source: 'dot', target: 'anim', sourceHandle: 'out', targetHandle: 'mobject' },
      { id: 'w2', source: 'anim', target: 'play', sourceHandle: 'out', targetHandle: 'animation' }
    ];

    const res = compileGraphToPython(nodes, edges);
    expect(res.success).toBe(true);

    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'manim_test_'));
    const testPy = path.join(tempDir, 'test_scene.py');
    fs.writeFileSync(testPy, res.pythonCode, 'utf-8');

    // Run python -m py_compile test_scene.py
    try {
      execFileSync('python', ['-m', 'py_compile', testPy], { stdio: 'pipe' });
      expect(true).toBe(true);
    } catch (err: any) {
      console.error('py_compile failed:', err.stderr?.toString());
      throw err;
    } finally {
      fs.rmSync(tempDir, { recursive: true, force: true });
    }
  });
});
