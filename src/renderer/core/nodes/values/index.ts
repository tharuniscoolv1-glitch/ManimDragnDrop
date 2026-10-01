import type { NodeDefinition } from '@shared/node-types';
import { formatColor, formatVector3 } from '../node-helpers';

export const valueNodes: NodeDefinition[] = [
  // Number
  {
    id: 'val.number',
    category: 'values',
    label: 'Number Value',
    description: 'Provides a numeric constant scalar',
    inputs: [],
    outputs: [
      { id: 'out', name: 'Number', type: 'Number' }
    ],
    params: [
      { id: 'value', label: 'Value', type: 'number', default: 1.0, step: 0.1 }
    ],
    codegen: (ctx) => {
      const val = ctx.params.value ?? 1.0;
      return {
        variableName: `${val}`
      };
    }
  },

  // Vector
  {
    id: 'val.vector',
    category: 'values',
    label: 'Vector3',
    description: 'A 3-dimensional vector [X, Y, Z] coordinate',
    inputs: [],
    outputs: [
      { id: 'out', name: 'Vector3', type: 'Vector3' }
    ],
    params: [
      { id: 'x', label: 'X', type: 'number', default: 0, step: 0.1 },
      { id: 'y', label: 'Y', type: 'number', default: 0, step: 0.1 },
      { id: 'z', label: 'Z', type: 'number', default: 0, step: 0.1 }
    ],
    codegen: (ctx) => {
      const x = ctx.params.x ?? 0;
      const y = ctx.params.y ?? 0;
      const z = ctx.params.z ?? 0;
      return {
        variableName: `np.array([${x}, ${y}, ${z}])`
      };
    }
  },

  // Color
  {
    id: 'val.color',
    category: 'values',
    label: 'Color Picker',
    description: 'Selects a custom color or Manim palette shade',
    inputs: [],
    outputs: [
      { id: 'out', name: 'Color', type: 'Color' }
    ],
    params: [
      { id: 'color', label: 'Color', type: 'color', default: '#38bdf8' }
    ],
    codegen: (ctx) => {
      return {
        variableName: formatColor(ctx.params.color ?? '#38bdf8')
      };
    }
  },

  // Math Expression
  {
    id: 'val.expression',
    category: 'values',
    label: 'Math Expression',
    description: 'Calculates a numeric value from a mathematical formula expression',
    inputs: [],
    outputs: [
      { id: 'out', name: 'Number', type: 'Number' }
    ],
    params: [
      { id: 'expr', label: 'Expression', type: 'string', default: '2 * PI' }
    ],
    codegen: (ctx) => {
      const expr = ctx.params.expr || '0';
      return {
        variableName: `(${expr})`
      };
    }
  },

  // Slider
  {
    id: 'val.slider',
    category: 'values',
    label: 'Slider Value',
    description: 'Interactive numerical slider within a defined min/max range',
    inputs: [],
    outputs: [
      { id: 'out', name: 'Number', type: 'Number' }
    ],
    params: [
      { id: 'value', label: 'Current Value', type: 'number', default: 2.0, min: 0, max: 10, step: 0.1 },
      { id: 'min', label: 'Min', type: 'number', default: 0 },
      { id: 'max', label: 'Max', type: 'number', default: 10 },
      { id: 'step', label: 'Step', type: 'number', default: 0.1 }
    ],
    codegen: (ctx) => {
      const val = ctx.params.value ?? 2.0;
      return {
        variableName: `${val}`
      };
    }
  }
];
