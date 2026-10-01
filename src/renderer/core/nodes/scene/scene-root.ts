import type { NodeDefinition } from '@shared/node-types';

export const sceneRootNode: NodeDefinition = {
  id: 'scene.root',
  category: 'scene',
  label: 'Scene Root',
  description: 'Defines the root scene settings and entry point of the animation flow',
  inputs: [],
  outputs: [
    {
      id: 'flow',
      name: 'Scene Flow',
      type: 'Scene-Flow',
      description: 'Connect to the first animation or composition step'
    }
  ],
  params: [
    {
      id: 'scene_name',
      label: 'Scene Name',
      type: 'string',
      default: 'GeneratedScene',
      description: 'The Python class name for the scene'
    },
    {
      id: 'background_color',
      label: 'Background Color',
      type: 'color',
      default: '#000000',
      description: 'Background color of the rendered scene'
    },
    {
      id: 'quality',
      label: 'Render Quality',
      type: 'select',
      default: 'low',
      options: [
        { label: 'Low (480p, 15fps)', value: 'low' },
        { label: 'Medium (720p, 30fps)', value: 'medium' },
        { label: 'High (1080p, 60fps)', value: 'high' },
        { label: '4K (2160p, 60fps)', value: 'four_k' }
      ]
    },
    {
      id: 'fps',
      label: 'Framerate (FPS)',
      type: 'number',
      default: 30,
      min: 15,
      max: 120
    }
  ],
  codegen: (ctx) => {
    const bg = ctx.params.background_color || '#000000';
    return {
      actionCode: [`self.camera.background_color = "${bg}"`]
    };
  }
};
