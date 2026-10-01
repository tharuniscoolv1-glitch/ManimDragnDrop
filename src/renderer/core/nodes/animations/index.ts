import type { NodeDefinition } from '@shared/node-types';
import { formatColor, formatVector3 } from '../node-helpers';

export const animationNodes: NodeDefinition[] = [
  // Create
  {
    id: 'anim.create',
    category: 'animations',
    label: 'Create',
    description: 'Animates drawing the borders and creating the mobject',
    inputs: [
      { id: 'mobject', name: 'Mobject', type: 'Mobject', required: true }
    ],
    outputs: [
      { id: 'out', name: 'Animation', type: 'Animation' }
    ],
    params: [
      { id: 'run_time', label: 'Run Time (s)', type: 'number', default: 1.0, min: 0.1, max: 20, step: 0.1 }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('anim');
      const target = ctx.inputVariableNames['mobject'] || 'mobject';
      const runTime = ctx.params.run_time ?? 1.0;
      return {
        variableName: varName,
        declarationCode: [
          `${varName} = Create(${target}, run_time=${runTime})`
        ]
      };
    }
  },

  // FadeIn
  {
    id: 'anim.fadein',
    category: 'animations',
    label: 'Fade In',
    description: 'Gradually brings a mobject into view with optional directional shift',
    inputs: [
      { id: 'mobject', name: 'Mobject', type: 'Mobject', required: true }
    ],
    outputs: [
      { id: 'out', name: 'Animation', type: 'Animation' }
    ],
    params: [
      { id: 'run_time', label: 'Run Time (s)', type: 'number', default: 1.0, min: 0.1, max: 20, step: 0.1 },
      { id: 'shift', label: 'Shift Direction', type: 'select', default: 'ORIGIN', options: [
        { label: 'None (In Place)', value: 'ORIGIN' },
        { label: 'Shift Up', value: 'UP' },
        { label: 'Shift Down', value: 'DOWN' },
        { label: 'Shift Left', value: 'LEFT' },
        { label: 'Shift Right', value: 'RIGHT' }
      ]}
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('anim');
      const target = ctx.inputVariableNames['mobject'] || 'mobject';
      const runTime = ctx.params.run_time ?? 1.0;
      const shift = ctx.params.shift && ctx.params.shift !== 'ORIGIN' ? `, shift=${ctx.params.shift}` : '';
      return {
        variableName: varName,
        declarationCode: [
          `${varName} = FadeIn(${target}${shift}, run_time=${runTime})`
        ]
      };
    }
  },

  // FadeOut
  {
    id: 'anim.fadeout',
    category: 'animations',
    label: 'Fade Out',
    description: 'Gradually fades a mobject away and removes it from the scene',
    inputs: [
      { id: 'mobject', name: 'Mobject', type: 'Mobject', required: true }
    ],
    outputs: [
      { id: 'out', name: 'Animation', type: 'Animation' }
    ],
    params: [
      { id: 'run_time', label: 'Run Time (s)', type: 'number', default: 1.0, min: 0.1, max: 20, step: 0.1 },
      { id: 'shift', label: 'Shift Direction', type: 'select', default: 'ORIGIN', options: [
        { label: 'None (In Place)', value: 'ORIGIN' },
        { label: 'Shift Up', value: 'UP' },
        { label: 'Shift Down', value: 'DOWN' },
        { label: 'Shift Left', value: 'LEFT' },
        { label: 'Shift Right', value: 'RIGHT' }
      ]}
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('anim');
      const target = ctx.inputVariableNames['mobject'] || 'mobject';
      const runTime = ctx.params.run_time ?? 1.0;
      const shift = ctx.params.shift && ctx.params.shift !== 'ORIGIN' ? `, shift=${ctx.params.shift}` : '';
      return {
        variableName: varName,
        declarationCode: [
          `${varName} = FadeOut(${target}${shift}, run_time=${runTime})`
        ]
      };
    }
  },

  // Write
  {
    id: 'anim.write',
    category: 'animations',
    label: 'Write',
    description: 'Simulates handwriting text or vector curves stroke-by-stroke',
    inputs: [
      { id: 'mobject', name: 'Mobject', type: 'Mobject', required: true }
    ],
    outputs: [
      { id: 'out', name: 'Animation', type: 'Animation' }
    ],
    params: [
      { id: 'run_time', label: 'Run Time (s)', type: 'number', default: 1.5, min: 0.1, max: 20, step: 0.1 }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('anim');
      const target = ctx.inputVariableNames['mobject'] || 'mobject';
      const runTime = ctx.params.run_time ?? 1.5;
      return {
        variableName: varName,
        declarationCode: [
          `${varName} = Write(${target}, run_time=${runTime})`
        ]
      };
    }
  },

  // Transform
  {
    id: 'anim.transform',
    category: 'animations',
    label: 'Transform',
    description: 'Morphs the source mobject into the shape and color of target mobject',
    inputs: [
      { id: 'source', name: 'Source Mobject', type: 'Mobject', required: true },
      { id: 'target', name: 'Target Mobject', type: 'Mobject', required: true }
    ],
    outputs: [
      { id: 'out', name: 'Animation', type: 'Animation' }
    ],
    params: [
      { id: 'run_time', label: 'Run Time (s)', type: 'number', default: 1.5, min: 0.1, max: 20, step: 0.1 }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('anim');
      const source = ctx.inputVariableNames['source'] || 'source_mob';
      const target = ctx.inputVariableNames['target'] || 'target_mob';
      const runTime = ctx.params.run_time ?? 1.5;
      return {
        variableName: varName,
        declarationCode: [
          `${varName} = Transform(${source}, ${target}, run_time=${runTime})`
        ]
      };
    }
  },

  // ReplacementTransform
  {
    id: 'anim.replacementtransform',
    category: 'animations',
    label: 'Replacement Transform',
    description: 'Morphs source into target and replaces source reference with target',
    inputs: [
      { id: 'source', name: 'Source Mobject', type: 'Mobject', required: true },
      { id: 'target', name: 'Target Mobject', type: 'Mobject', required: true }
    ],
    outputs: [
      { id: 'out', name: 'Animation', type: 'Animation' }
    ],
    params: [
      { id: 'run_time', label: 'Run Time (s)', type: 'number', default: 1.5, min: 0.1, max: 20, step: 0.1 }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('anim');
      const source = ctx.inputVariableNames['source'] || 'source_mob';
      const target = ctx.inputVariableNames['target'] || 'target_mob';
      const runTime = ctx.params.run_time ?? 1.5;
      return {
        variableName: varName,
        declarationCode: [
          `${varName} = ReplacementTransform(${source}, ${target}, run_time=${runTime})`
        ]
      };
    }
  },

  // Rotate
  {
    id: 'anim.rotate',
    category: 'animations',
    label: 'Rotate',
    description: 'Rotates a mobject by a specified angle in radians or degrees',
    inputs: [
      { id: 'mobject', name: 'Mobject', type: 'Mobject', required: true }
    ],
    outputs: [
      { id: 'out', name: 'Animation', type: 'Animation' }
    ],
    params: [
      { id: 'angle', label: 'Angle (e.g. PI, PI/2, 2*PI)', type: 'string', default: 'PI' },
      { id: 'run_time', label: 'Run Time (s)', type: 'number', default: 1.0, min: 0.1, max: 20, step: 0.1 }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('anim');
      const target = ctx.inputVariableNames['mobject'] || 'mobject';
      const angle = ctx.params.angle || 'PI';
      const runTime = ctx.params.run_time ?? 1.0;
      return {
        variableName: varName,
        declarationCode: [
          `${varName} = Rotate(${target}, angle=${angle}, run_time=${runTime})`
        ]
      };
    }
  },

  // Shift / MoveTo
  {
    id: 'anim.shift',
    category: 'animations',
    label: 'Shift / MoveTo',
    description: 'Animates translating a mobject along a vector or to a target point',
    inputs: [
      { id: 'mobject', name: 'Mobject', type: 'Mobject', required: true },
      { id: 'vector', name: 'Vector', type: 'Vector3' }
    ],
    outputs: [
      { id: 'out', name: 'Animation', type: 'Animation' }
    ],
    params: [
      { id: 'mode', label: 'Mode', type: 'select', default: 'shift', options: [
        { label: 'Shift by Vector', value: 'shift' },
        { label: 'Move to Point', value: 'move_to' }
      ]},
      { id: 'vector', label: 'Vector [X, Y, Z]', type: 'vector3', default: [2, 0, 0] },
      { id: 'run_time', label: 'Run Time (s)', type: 'number', default: 1.0, min: 0.1, max: 20, step: 0.1 }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('anim');
      const target = ctx.inputVariableNames['mobject'] || 'mobject';
      const vec = ctx.inputVariableNames['vector'] ?? formatVector3(ctx.params.vector ?? [2, 0, 0]);
      const mode = ctx.params.mode === 'move_to' ? 'move_to' : 'shift';
      const runTime = ctx.params.run_time ?? 1.0;
      return {
        variableName: varName,
        declarationCode: [
          `${varName} = ${target}.animate(run_time=${runTime}).${mode}(${vec})`
        ]
      };
    }
  },

  // Scale
  {
    id: 'anim.scale',
    category: 'animations',
    label: 'Scale',
    description: 'Animates scaling a mobject by a factor',
    inputs: [
      { id: 'mobject', name: 'Mobject', type: 'Mobject', required: true }
    ],
    outputs: [
      { id: 'out', name: 'Animation', type: 'Animation' }
    ],
    params: [
      { id: 'factor', label: 'Scale Factor', type: 'number', default: 1.5, min: 0.1, max: 10, step: 0.1 },
      { id: 'run_time', label: 'Run Time (s)', type: 'number', default: 1.0, min: 0.1, max: 20, step: 0.1 }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('anim');
      const target = ctx.inputVariableNames['mobject'] || 'mobject';
      const factor = ctx.params.factor ?? 1.5;
      const runTime = ctx.params.run_time ?? 1.0;
      return {
        variableName: varName,
        declarationCode: [
          `${varName} = ${target}.animate(run_time=${runTime}).scale(${factor})`
        ]
      };
    }
  },

  // Indicate
  {
    id: 'anim.indicate',
    category: 'animations',
    label: 'Indicate',
    description: 'Briefly flashes and scales up a mobject to draw viewer attention',
    inputs: [
      { id: 'mobject', name: 'Mobject', type: 'Mobject', required: true }
    ],
    outputs: [
      { id: 'out', name: 'Animation', type: 'Animation' }
    ],
    params: [
      { id: 'color', label: 'Highlight Color', type: 'color', default: '#facc15' },
      { id: 'scale_factor', label: 'Scale Factor', type: 'number', default: 1.25, min: 1.0, max: 3.0, step: 0.05 },
      { id: 'run_time', label: 'Run Time (s)', type: 'number', default: 1.0, min: 0.1, max: 10, step: 0.1 }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('anim');
      const target = ctx.inputVariableNames['mobject'] || 'mobject';
      const color = formatColor(ctx.params.color ?? '#facc15');
      const scaleFactor = ctx.params.scale_factor ?? 1.25;
      const runTime = ctx.params.run_time ?? 1.0;
      return {
        variableName: varName,
        declarationCode: [
          `${varName} = Indicate(${target}, color=${color}, scale_factor=${scaleFactor}, run_time=${runTime})`
        ]
      };
    }
  },

  // GrowFromCenter
  {
    id: 'anim.growfromcenter',
    category: 'animations',
    label: 'Grow From Center',
    description: 'Expands a mobject outward starting from its geometric center',
    inputs: [
      { id: 'mobject', name: 'Mobject', type: 'Mobject', required: true }
    ],
    outputs: [
      { id: 'out', name: 'Animation', type: 'Animation' }
    ],
    params: [
      { id: 'run_time', label: 'Run Time (s)', type: 'number', default: 1.0, min: 0.1, max: 20, step: 0.1 }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('anim');
      const target = ctx.inputVariableNames['mobject'] || 'mobject';
      const runTime = ctx.params.run_time ?? 1.0;
      return {
        variableName: varName,
        declarationCode: [
          `${varName} = GrowFromCenter(${target}, run_time=${runTime})`
        ]
      };
    }
  },

  // DrawBorderThenFill
  {
    id: 'anim.drawborderthenfill',
    category: 'animations',
    label: 'Draw Border Then Fill',
    description: 'First traces the perimeter outline, then fills in interior color',
    inputs: [
      { id: 'mobject', name: 'Mobject', type: 'Mobject', required: true }
    ],
    outputs: [
      { id: 'out', name: 'Animation', type: 'Animation' }
    ],
    params: [
      { id: 'run_time', label: 'Run Time (s)', type: 'number', default: 1.5, min: 0.1, max: 20, step: 0.1 }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('anim');
      const target = ctx.inputVariableNames['mobject'] || 'mobject';
      const runTime = ctx.params.run_time ?? 1.5;
      return {
        variableName: varName,
        declarationCode: [
          `${varName} = DrawBorderThenFill(${target}, run_time=${runTime})`
        ]
      };
    }
  }
];
