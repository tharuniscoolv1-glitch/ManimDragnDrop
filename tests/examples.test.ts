import { describe, it, expect } from 'vitest';
import { compileGraphToPython } from '../src/renderer/core/compiler/code-generator';
import { EXAMPLES } from '../src/renderer/examples';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { execFileSync } from 'child_process';

describe('Built-in Example Projects Compilation & Syntax', () => {
  for (const example of EXAMPLES) {
    it(`Example "${example.title}" compiles successfully and passes python py_compile`, () => {
      const res = compileGraphToPython(example.project.nodes, example.project.edges, true);

      expect(res.success).toBe(true);
      expect(res.errors.filter((e) => e.type === 'error').length).toBe(0);
      expect(res.pythonCode).toContain('class ');
      expect(res.pythonCode).toContain('def construct(self):');

      // Verify syntax using python -m py_compile
      const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'manim_example_test_'));
      const testPy = path.join(tempDir, `${res.sceneClassName}.py`);
      fs.writeFileSync(testPy, res.pythonCode, 'utf-8');

      try {
        execFileSync('python', ['-m', 'py_compile', testPy], { stdio: 'pipe' });
        expect(true).toBe(true);
      } catch (err: any) {
        console.error(`Syntax error in example ${example.title}:`, err.stderr?.toString());
        throw err;
      } finally {
        fs.rmSync(tempDir, { recursive: true, force: true });
      }
    });
  }
});
