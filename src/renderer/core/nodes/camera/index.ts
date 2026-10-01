import type { NodeDefinition } from '@shared/node-types';
import { formatVector3 } from '../node-helpers';

export const cameraNodes: NodeDefinition[] = [
  // Camera Move / Zoom
  {
    id: 'camera.move',
    category: 'camera',
    label: 'Camera Move / Zoom',
    description: 'Animates camera pan and zoom (enables MovingCameraScene)',
    inputs: [
      { id: 'flow_in', name: 'Scene Flow', type: 'Scene-Flow', required: true }
    ],
    outputs: [
      { id: 'flow_out', name: 'Scene Flow', type: 'Scene-Flow' }
    ],
    params: [
      { id: 'zoom', label: 'Zoom Scale (1 = Normal, 2 = 2x Zoom In)', type: 'number', default: 1.5, min: 0.1, max: 10, step: 0.1 },
      { id: 'frame_center', label: 'Center Target [X, Y, Z]', type: 'vector3', default: [0, 0, 0] },
      { id: 'run_time', label: 'Run Time (s)', type: 'number', default: 1.5, min: 0.1, max: 20, step: 0.1 }
    ],
    codegen: (ctx) => {
      const zoom = Number(ctx.params.zoom) || 1.0;
      const widthFactor = 1.0 / zoom;
      const center = formatVector3(ctx.params.frame_center ?? [0, 0, 0]);
      const runTime = ctx.params.run_time ?? 1.5;

      return {
        actionCode: [
          `self.play(self.camera.frame.animate.scale(${widthFactor}).move_to(${center}), run_time=${runTime})`
        ]
      };
    }
  }
];
