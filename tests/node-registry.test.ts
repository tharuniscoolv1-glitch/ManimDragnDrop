import { describe, it, expect } from 'vitest';
import { getAllNodeDefinitions, getNodeDefinition, CATEGORY_LABELS } from '../src/renderer/core/node-registry';
import type { CodegenContext } from '../src/shared/node-types';

describe('Node Registry Integrity', () => {
  const allNodes = getAllNodeDefinitions();

  it('contains all required node definitions', () => {
    expect(allNodes.length).toBeGreaterThanOrEqual(25);
  });

  for (const node of allNodes) {
    it(`Node [${node.id}] (${node.label}) has valid schema and working codegen`, () => {
      expect(node.id).toBeDefined();
      expect(node.label).toBeDefined();
      expect(node.category).toBeDefined();
      expect(CATEGORY_LABELS[node.category]).toBeDefined();
      expect(Array.isArray(node.inputs)).toBe(true);
      expect(Array.isArray(node.outputs)).toBe(true);
      expect(Array.isArray(node.params)).toBe(true);

      // Verify dummy codegen call does not throw
      const dummyParams: Record<string, any> = {};
      for (const p of node.params) {
        dummyParams[p.id] = p.default;
      }

      let varCounter = 0;
      const ctx: CodegenContext = {
        nodeId: 'test_node_id',
        params: dummyParams,
        inputVariableNames: {},
        allocateVariable: (p) => `${p}_${++varCounter}`
      };

      const out = node.codegen(ctx);
      expect(out).toBeDefined();
      if (node.outputs.length > 0 && node.outputs[0].type !== 'Scene-Flow') {
        expect(out.variableName).toBeDefined();
      }
    });
  }
});
