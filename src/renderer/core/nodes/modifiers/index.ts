import type { NodeDefinition } from '@shared/node-types';
import { formatColor, formatDirection, formatVector3 } from '../node-helpers';

export const modifierNodes: NodeDefinition[] = [
  // Set Color
  {
    id: 'mod.setcolor',
    category: 'modifiers',
    label: 'Set Color',
    description: 'Modifies the stroke and fill color of an existing mobject',
    inputs: [
      { id: 'mobject', name: 'Mobject In', type: 'Mobject', required: true },
      { id: 'color', name: 'Color', type: 'Color' }
    ],
    outputs: [
      { id: 'out', name: 'Mobject Out', type: 'Mobject' }
    ],
    params: [
      { id: 'color', label: 'Color', type: 'color', default: '#ec4899' }
    ],
    codegen: (ctx) => {
      const target = ctx.inputVariableNames['mobject'] || 'mob';
      const color = ctx.inputVariableNames['color'] ? ctx.inputVariableNames['color'] : formatColor(ctx.params.color ?? '#ec4899');
      return {
        variableName: target,
        declarationCode: [
          `${target}.set_color(${color})`
        ]
      };
    }
  },

  // Set Fill
  {
    id: 'mod.setfill',
    category: 'modifiers',
    label: 'Set Fill',
    description: 'Adjusts interior fill color and opacity of a mobject',
    inputs: [
      { id: 'mobject', name: 'Mobject In', type: 'Mobject', required: true },
      { id: 'color', name: 'Color', type: 'Color' }
    ],
    outputs: [
      { id: 'out', name: 'Mobject Out', type: 'Mobject' }
    ],
    params: [
      { id: 'color', label: 'Fill Color', type: 'color', default: '#3b82f6' },
      { id: 'opacity', label: 'Opacity', type: 'number', default: 0.75, min: 0, max: 1, step: 0.05 }
    ],
    codegen: (ctx) => {
      const target = ctx.inputVariableNames['mobject'] || 'mob';
      const color = ctx.inputVariableNames['color'] ? ctx.inputVariableNames['color'] : formatColor(ctx.params.color ?? '#3b82f6');
      const opacity = ctx.params.opacity ?? 0.75;
      return {
        variableName: target,
        declarationCode: [
          `${target}.set_fill(${color}, opacity=${opacity})`
        ]
      };
    }
  },

  // Set Stroke
  {
    id: 'mod.setstroke',
    category: 'modifiers',
    label: 'Set Stroke',
    description: 'Adjusts border stroke color and width of a mobject',
    inputs: [
      { id: 'mobject', name: 'Mobject In', type: 'Mobject', required: true },
      { id: 'color', name: 'Color', type: 'Color' }
    ],
    outputs: [
      { id: 'out', name: 'Mobject Out', type: 'Mobject' }
    ],
    params: [
      { id: 'color', label: 'Stroke Color', type: 'color', default: '#ffffff' },
      { id: 'width', label: 'Stroke Width', type: 'number', default: 4, min: 0, max: 30, step: 0.5 }
    ],
    codegen: (ctx) => {
      const target = ctx.inputVariableNames['mobject'] || 'mob';
      const color = ctx.inputVariableNames['color'] ? ctx.inputVariableNames['color'] : formatColor(ctx.params.color ?? '#ffffff');
      const width = ctx.params.width ?? 4;
      return {
        variableName: target,
        declarationCode: [
          `${target}.set_stroke(${color}, width=${width})`
        ]
      };
    }
  },

  // Next To
  {
    id: 'mod.nextto',
    category: 'modifiers',
    label: 'Next To / Arrange',
    description: 'Positions a mobject adjacent to another reference mobject',
    inputs: [
      { id: 'mobject', name: 'Mobject In', type: 'Mobject', required: true },
      { id: 'target', name: 'Adjacent Target', type: 'Mobject', required: true }
    ],
    outputs: [
      { id: 'out', name: 'Mobject Out', type: 'Mobject' }
    ],
    params: [
      { id: 'direction', label: 'Direction', type: 'select', default: 'DOWN', options: [
        { label: 'Down', value: 'DOWN' },
        { label: 'Up', value: 'UP' },
        { label: 'Right', value: 'RIGHT' },
        { label: 'Left', value: 'LEFT' }
      ]},
      { id: 'buff', label: 'Buffer Spacing', type: 'number', default: 0.5, min: 0, max: 5, step: 0.1 }
    ],
    codegen: (ctx) => {
      const subject = ctx.inputVariableNames['mobject'] || 'mob';
      const target = ctx.inputVariableNames['target'] || 'ref_mob';
      const dir = formatDirection(ctx.params.direction || 'DOWN');
      const buff = ctx.params.buff ?? 0.5;
      return {
        variableName: subject,
        declarationCode: [
          `${subject}.next_to(${target}, ${dir}, buff=${buff})`
        ]
      };
    }
  },

  // Position
  {
    id: 'mod.position',
    category: 'modifiers',
    label: 'Position (To Edge / Shift)',
    description: 'Places a mobject at a screen edge or shifts it by an offset',
    inputs: [
      { id: 'mobject', name: 'Mobject In', type: 'Mobject', required: true }
    ],
    outputs: [
      { id: 'out', name: 'Mobject Out', type: 'Mobject' }
    ],
    params: [
      { id: 'mode', label: 'Position Mode', type: 'select', default: 'to_edge', options: [
        { label: 'To Screen Edge', value: 'to_edge' },
        { label: 'Shift by Vector', value: 'shift' },
        { label: 'Move to Point', value: 'move_to' }
      ]},
      { id: 'edge', label: 'Edge / Direction', type: 'select', default: 'UP', options: [
        { label: 'Top / UP', value: 'UP' },
        { label: 'Bottom / DOWN', value: 'DOWN' },
        { label: 'Left / LEFT', value: 'LEFT' },
        { label: 'Right / RIGHT', value: 'RIGHT' },
        { label: 'Top-Left / UL', value: 'UL' },
        { label: 'Top-Right / UR', value: 'UR' },
        { label: 'Bottom-Left / DL', value: 'DL' },
        { label: 'Bottom-Right / DR', value: 'DR' },
        { label: 'Center / ORIGIN', value: 'ORIGIN' }
      ]},
      { id: 'vector', label: 'Vector [X, Y, Z] (for Shift / Move)', type: 'vector3', default: [0, 2, 0] },
      { id: 'buff', label: 'Buffer (for Edge)', type: 'number', default: 0.5, min: 0, max: 4, step: 0.1 }
    ],
    codegen: (ctx) => {
      const subject = ctx.inputVariableNames['mobject'] || 'mob';
      const mode = ctx.params.mode || 'to_edge';
      if (mode === 'to_edge') {
        const edge = formatDirection(ctx.params.edge || 'UP');
        const buff = ctx.params.buff ?? 0.5;
        return {
          variableName: subject,
          declarationCode: [
            `${subject}.to_edge(${edge}, buff=${buff})`
          ]
        };
      } else {
        const vec = formatVector3(ctx.params.vector ?? [0, 2, 0]);
        return {
          variableName: subject,
          declarationCode: [
            `${subject}.${mode}(${vec})`
          ]
        };
      }
    }
  }
];
