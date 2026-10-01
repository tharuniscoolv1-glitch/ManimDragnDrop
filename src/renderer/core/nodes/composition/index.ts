import type { NodeDefinition } from '@shared/node-types';

export const compositionNodes: NodeDefinition[] = [
  // Play
  {
    id: 'comp.play',
    category: 'composition',
    label: 'Play',
    description: 'Executes one or more animations (or animates mobjects) in the playback flow',
    inputs: [
      { id: 'flow_in', name: 'Scene Flow', type: 'Scene-Flow', required: true },
      { id: 'animation', name: 'Animation / Mobject', type: 'Animation', allowMultipleConnections: true, required: true }
    ],
    outputs: [
      { id: 'flow_out', name: 'Scene Flow', type: 'Scene-Flow' }
    ],
    params: [
      { id: 'run_time', label: 'Run Time Override (s)', type: 'number', default: 0, min: 0, max: 30, step: 0.1, description: 'Leave 0 to use animation duration' }
    ],
    codegen: (ctx) => {
      const anims = ctx.inputVariableNames['animation'];
      let animList = 'Wait(1)';
      if (anims && anims.trim().length > 0) {
        const parts = anims.split(',').map((s) => s.trim());
        const wrapped = parts.map((p) => {
          if (
            p.startsWith('Create(') ||
            p.startsWith('FadeIn(') ||
            p.startsWith('FadeOut(') ||
            p.startsWith('Write(') ||
            p.startsWith('Transform(') ||
            p.startsWith('ReplacementTransform(') ||
            p.startsWith('Rotate(') ||
            p.startsWith('Indicate(') ||
            p.startsWith('GrowFromCenter(') ||
            p.startsWith('DrawBorderThenFill(') ||
            p.startsWith('AnimationGroup(') ||
            p.startsWith('LaggedStart(') ||
            p.startsWith('Succession(') ||
            p.startsWith('anim_') ||
            p.startsWith('lagged_') ||
            p.startsWith('succ_') ||
            p.startsWith('anim_group_')
          ) {
            return p;
          }
          // If a Mobject was directly wired to Play, auto-wrap in Create(mobject)
          return `Create(${p})`;
        });
        animList = wrapped.join(', ');
      }
      const rawRt = ctx.params.run_time;
      const runTime = typeof rawRt === 'number' ? rawRt : (parseFloat(rawRt) || 0);
      const rtSuffix = runTime > 0 ? `, run_time=${runTime}` : '';

      return {
        actionCode: [
          `self.play(${animList}${rtSuffix})`
        ]
      };
    }
  },

  // Wait
  {
    id: 'comp.wait',
    category: 'composition',
    label: 'Wait',
    description: 'Pauses the scene playback for a specified duration in seconds',
    inputs: [
      { id: 'flow_in', name: 'Scene Flow', type: 'Scene-Flow', required: true },
      { id: 'duration', name: 'Duration (s)', type: 'Number' },
      { id: 'mobjects', name: 'Show Mobject(s)', type: 'Mobject', allowMultipleConnections: true }
    ],
    outputs: [
      { id: 'flow_out', name: 'Scene Flow', type: 'Scene-Flow' }
    ],
    params: [
      { id: 'duration', label: 'Duration (s)', type: 'number', default: 1.0, min: 0.1, max: 60, step: 0.1 }
    ],
    codegen: (ctx) => {
      const rawDur = ctx.inputVariableNames['duration'] ?? ctx.params.duration;
      let dur = typeof rawDur === 'number' ? rawDur : (parseFloat(rawDur) || 1.0);
      if (isNaN(dur) || dur <= 0) dur = 1.0;

      const actions: string[] = [];
      const mobs = ctx.inputVariableNames['mobjects'];
      if (mobs && mobs.trim().length > 0) {
        actions.push(`self.add(${mobs})`);
      }
      actions.push(`self.wait(${dur})`);
      return {
        actionCode: actions
      };
    }
  },

  // Show / Add to Scene
  {
    id: 'comp.add',
    category: 'composition',
    label: 'Show / Add to Scene',
    description: 'Places one or more mobjects onto the scene immediately without animation',
    inputs: [
      { id: 'flow_in', name: 'Scene Flow', type: 'Scene-Flow', required: true },
      { id: 'mobjects', name: 'Mobject(s)', type: 'Mobject', allowMultipleConnections: true, required: true }
    ],
    outputs: [
      { id: 'flow_out', name: 'Scene Flow', type: 'Scene-Flow' }
    ],
    params: [],
    codegen: (ctx) => {
      const mobs = ctx.inputVariableNames['mobjects'] || '';
      return {
        actionCode: mobs ? [`self.add(${mobs})`] : []
      };
    }
  },

  // AnimationGroup
  {
    id: 'comp.animationgroup',
    category: 'composition',
    label: 'Animation Group',
    description: 'Groups multiple animations to run together with optional lag',
    inputs: [
      { id: 'animations', name: 'Animations', type: 'Animation', allowMultipleConnections: true, required: true }
    ],
    outputs: [
      { id: 'out', name: 'Animation', type: 'Animation' }
    ],
    params: [
      { id: 'lag_ratio', label: 'Lag Ratio', type: 'number', default: 0.0, min: 0, max: 1, step: 0.05 }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('anim_group');
      const anims = ctx.inputVariableNames['animations'] || '';
      const rawLag = ctx.params.lag_ratio;
      const lagRatio = typeof rawLag === 'number' ? rawLag : (parseFloat(rawLag) || 0.0);
      return {
        variableName: varName,
        declarationCode: [
          `${varName} = AnimationGroup(${anims}, lag_ratio=${lagRatio})`
        ]
      };
    }
  },

  // LaggedStart
  {
    id: 'comp.laggedstart',
    category: 'composition',
    label: 'Lagged Start',
    description: 'Plays a sequence of animations staggered one after another with lag delay',
    inputs: [
      { id: 'animations', name: 'Animations', type: 'Animation', allowMultipleConnections: true, required: true }
    ],
    outputs: [
      { id: 'out', name: 'Animation', type: 'Animation' }
    ],
    params: [
      { id: 'lag_ratio', label: 'Lag Ratio', type: 'number', default: 0.25, min: 0.05, max: 1, step: 0.05 }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('lagged');
      const anims = ctx.inputVariableNames['animations'] || '';
      const rawLag = ctx.params.lag_ratio;
      const lagRatio = typeof rawLag === 'number' ? rawLag : (parseFloat(rawLag) || 0.25);
      return {
        variableName: varName,
        declarationCode: [
          `${varName} = LaggedStart(${anims}, lag_ratio=${lagRatio})`
        ]
      };
    }
  },

  // Succession
  {
    id: 'comp.succession',
    category: 'composition',
    label: 'Succession',
    description: 'Chains animations to play sequentially end-to-end within a single animation container',
    inputs: [
      { id: 'animations', name: 'Animations', type: 'Animation', allowMultipleConnections: true, required: true }
    ],
    outputs: [
      { id: 'out', name: 'Animation', type: 'Animation' }
    ],
    params: [],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('succ');
      const anims = ctx.inputVariableNames['animations'] || '';
      return {
        variableName: varName,
        declarationCode: [
          `${varName} = Succession(${anims})`
        ]
      };
    }
  }
];
