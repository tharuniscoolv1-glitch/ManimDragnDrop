import type { ProjectFile } from '@shared/graph-types';

export interface ExampleProject {
  id: string;
  title: string;
  description: string;
  tags: string[];
  project: ProjectFile;
}

export const EXAMPLES: ExampleProject[] = [
  {
    id: 'circle-to-square',
    title: 'Circle to Square Transform',
    description: 'Creates a blue circle and morphs it smoothly into a red square using Transform.',
    tags: ['Mobjects', 'Transform', 'Basics'],
    project: {
      schemaVersion: 1,
      name: 'Circle to Square Transform',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      settings: {
        sceneName: 'CircleToSquareScene',
        quality: 'low',
        resolution: [854, 480],
        fps: 30,
        backgroundColor: '#0d1117',
        transparent: false
      },
      viewport: { x: 50, y: 50, zoom: 0.9 },
      nodes: [
        {
          id: 'root',
          type: 'customNode',
          position: { x: 50, y: 150 },
          data: {
            definitionId: 'scene.root',
            params: { scene_name: 'CircleToSquareScene', background_color: '#0d1117', quality: 'low', fps: 30 }
          }
        },
        {
          id: 'circle',
          type: 'customNode',
          position: { x: 320, y: 20 },
          data: {
            definitionId: 'mobject.circle',
            params: { radius: 1.8, color: '#38bdf8', fill_opacity: 0.6, stroke_width: 4 }
          }
        },
        {
          id: 'square',
          type: 'customNode',
          position: { x: 320, y: 280 },
          data: {
            definitionId: 'mobject.square',
            params: { side_length: 3.0, color: '#f43f5e', fill_opacity: 0.6, stroke_width: 4 }
          }
        },
        {
          id: 'create_anim',
          type: 'customNode',
          position: { x: 560, y: 20 },
          data: {
            definitionId: 'anim.create',
            params: { run_time: 1.2 }
          }
        },
        {
          id: 'transform_anim',
          type: 'customNode',
          position: { x: 560, y: 260 },
          data: {
            definitionId: 'anim.transform',
            params: { run_time: 1.5 }
          }
        },
        {
          id: 'play_1',
          type: 'customNode',
          position: { x: 800, y: 100 },
          data: {
            definitionId: 'comp.play',
            params: { run_time: 0 }
          }
        },
        {
          id: 'play_2',
          type: 'customNode',
          position: { x: 1040, y: 100 },
          data: {
            definitionId: 'comp.play',
            params: { run_time: 0 }
          }
        },
        {
          id: 'wait_1',
          type: 'customNode',
          position: { x: 1280, y: 100 },
          data: {
            definitionId: 'comp.wait',
            params: { duration: 1.5 }
          }
        }
      ],
      edges: [
        { id: 'e1', source: 'root', target: 'play_1', sourceHandle: 'flow', targetHandle: 'flow_in', type: 'customEdge' },
        { id: 'e2', source: 'play_1', target: 'play_2', sourceHandle: 'flow_out', targetHandle: 'flow_in', type: 'customEdge' },
        { id: 'e3', source: 'play_2', target: 'wait_1', sourceHandle: 'flow_out', targetHandle: 'flow_in', type: 'customEdge' },
        { id: 'e4', source: 'circle', target: 'create_anim', sourceHandle: 'out', targetHandle: 'mobject', type: 'customEdge' },
        { id: 'e5', source: 'create_anim', target: 'play_1', sourceHandle: 'out', targetHandle: 'animation', type: 'customEdge' },
        { id: 'e6', source: 'circle', target: 'transform_anim', sourceHandle: 'out', targetHandle: 'source', type: 'customEdge' },
        { id: 'e7', source: 'square', target: 'transform_anim', sourceHandle: 'out', targetHandle: 'target', type: 'customEdge' },
        { id: 'e8', source: 'transform_anim', target: 'play_2', sourceHandle: 'out', targetHandle: 'animation', type: 'customEdge' }
      ]
    }
  },
  {
    id: 'sine-wave-axes',
    title: 'Sine Wave on Coordinate Axes',
    description: 'Creates 2D Cartesian axes, plots a mathematical sine curve, and renders the graph drawing animation.',
    tags: ['Axes', 'GraphPlot', 'Math'],
    project: {
      schemaVersion: 1,
      name: 'Sine Wave on Axes',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      settings: {
        sceneName: 'SineWaveScene',
        quality: 'low',
        resolution: [854, 480],
        fps: 30,
        backgroundColor: '#0d1117',
        transparent: false
      },
      viewport: { x: 50, y: 50, zoom: 0.9 },
      nodes: [
        {
          id: 'root',
          type: 'customNode',
          position: { x: 50, y: 150 },
          data: {
            definitionId: 'scene.root',
            params: { scene_name: 'SineWaveScene', background_color: '#0d1117', quality: 'low', fps: 30 }
          }
        },
        {
          id: 'axes',
          type: 'customNode',
          position: { x: 300, y: 30 },
          data: {
            definitionId: 'mobject.axes',
            params: { x_min: -4, x_max: 4, x_step: 1, y_min: -2, y_max: 2, y_step: 1, x_length: 8, y_length: 4.5, tips: true }
          }
        },
        {
          id: 'graph',
          type: 'customNode',
          position: { x: 560, y: 30 },
          data: {
            definitionId: 'mobject.graphplot',
            params: { function_expr: 'np.sin(x)', x_min: -3.5, x_max: 3.5, color: '#38bdf8' }
          }
        },
        {
          id: 'anim_axes',
          type: 'customNode',
          position: { x: 560, y: 250 },
          data: {
            definitionId: 'anim.create',
            params: { run_time: 1.5 }
          }
        },
        {
          id: 'anim_graph',
          type: 'customNode',
          position: { x: 800, y: 30 },
          data: {
            definitionId: 'anim.create',
            params: { run_time: 2.0 }
          }
        },
        {
          id: 'play_1',
          type: 'customNode',
          position: { x: 800, y: 250 },
          data: {
            definitionId: 'comp.play',
            params: { run_time: 0 }
          }
        },
        {
          id: 'play_2',
          type: 'customNode',
          position: { x: 1040, y: 250 },
          data: {
            definitionId: 'comp.play',
            params: { run_time: 0 }
          }
        },
        {
          id: 'wait_1',
          type: 'customNode',
          position: { x: 1280, y: 250 },
          data: {
            definitionId: 'comp.wait',
            params: { duration: 1.5 }
          }
        }
      ],
      edges: [
        { id: 'e1', source: 'root', target: 'play_1', sourceHandle: 'flow', targetHandle: 'flow_in', type: 'customEdge' },
        { id: 'e2', source: 'play_1', target: 'play_2', sourceHandle: 'flow_out', targetHandle: 'flow_in', type: 'customEdge' },
        { id: 'e3', source: 'play_2', target: 'wait_1', sourceHandle: 'flow_out', targetHandle: 'flow_in', type: 'customEdge' },
        { id: 'e4', source: 'axes', target: 'graph', sourceHandle: 'out', targetHandle: 'axes', type: 'customEdge' },
        { id: 'e5', source: 'axes', target: 'anim_axes', sourceHandle: 'out', targetHandle: 'mobject', type: 'customEdge' },
        { id: 'e6', source: 'anim_axes', target: 'play_1', sourceHandle: 'out', targetHandle: 'animation', type: 'customEdge' },
        { id: 'e7', source: 'graph', target: 'anim_graph', sourceHandle: 'out', targetHandle: 'mobject', type: 'customEdge' },
        { id: 'e8', source: 'anim_graph', target: 'play_2', sourceHandle: 'out', targetHandle: 'animation', type: 'customEdge' }
      ]
    }
  },
  {
    id: 'pythagorean-theorem',
    title: 'Pythagorean Theorem Text Reveal',
    description: 'Presents the theorem title using Text and renders the algebraic formulation using Write animation.',
    tags: ['Text', 'MathTex', 'Write'],
    project: {
      schemaVersion: 1,
      name: 'Pythagorean Theorem',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      settings: {
        sceneName: 'PythagoreanScene',
        quality: 'low',
        resolution: [854, 480],
        fps: 30,
        backgroundColor: '#0d1117',
        transparent: false
      },
      viewport: { x: 50, y: 50, zoom: 0.9 },
      nodes: [
        {
          id: 'root',
          type: 'customNode',
          position: { x: 50, y: 150 },
          data: {
            definitionId: 'scene.root',
            params: { scene_name: 'PythagoreanScene', background_color: '#0d1117', quality: 'low', fps: 30 }
          }
        },
        {
          id: 'title_text',
          type: 'customNode',
          position: { x: 300, y: 30 },
          data: {
            definitionId: 'mobject.text',
            params: { text: 'Pythagorean Theorem', font_size: 44, color: '#facc15' }
          }
        },
        {
          id: 'pos_title',
          type: 'customNode',
          position: { x: 560, y: 30 },
          data: {
            definitionId: 'mod.position',
            params: { mode: 'to_edge', edge: 'UP', buff: 1.0 }
          }
        },
        {
          id: 'formula_text',
          type: 'customNode',
          position: { x: 300, y: 280 },
          data: {
            definitionId: 'mobject.text',
            params: { text: 'a^2 + b^2 = c^2', font_size: 52, color: '#38bdf8' }
          }
        },
        {
          id: 'anim_write_title',
          type: 'customNode',
          position: { x: 800, y: 30 },
          data: {
            definitionId: 'anim.write',
            params: { run_time: 1.2 }
          }
        },
        {
          id: 'anim_write_formula',
          type: 'customNode',
          position: { x: 560, y: 280 },
          data: {
            definitionId: 'anim.write',
            params: { run_time: 1.5 }
          }
        },
        {
          id: 'play_1',
          type: 'customNode',
          position: { x: 1040, y: 50 },
          data: {
            definitionId: 'comp.play',
            params: { run_time: 0 }
          }
        },
        {
          id: 'play_2',
          type: 'customNode',
          position: { x: 1040, y: 260 },
          data: {
            definitionId: 'comp.play',
            params: { run_time: 0 }
          }
        },
        {
          id: 'wait_1',
          type: 'customNode',
          position: { x: 1280, y: 150 },
          data: {
            definitionId: 'comp.wait',
            params: { duration: 2.0 }
          }
        }
      ],
      edges: [
        { id: 'e1', source: 'root', target: 'play_1', sourceHandle: 'flow', targetHandle: 'flow_in', type: 'customEdge' },
        { id: 'e2', source: 'play_1', target: 'play_2', sourceHandle: 'flow_out', targetHandle: 'flow_in', type: 'customEdge' },
        { id: 'e3', source: 'play_2', target: 'wait_1', sourceHandle: 'flow_out', targetHandle: 'flow_in', type: 'customEdge' },
        { id: 'e4', source: 'title_text', target: 'pos_title', sourceHandle: 'out', targetHandle: 'mobject', type: 'customEdge' },
        { id: 'e5', source: 'pos_title', target: 'anim_write_title', sourceHandle: 'out', targetHandle: 'mobject', type: 'customEdge' },
        { id: 'e6', source: 'anim_write_title', target: 'play_1', sourceHandle: 'out', targetHandle: 'animation', type: 'customEdge' },
        { id: 'e7', source: 'formula_text', target: 'anim_write_formula', sourceHandle: 'out', targetHandle: 'mobject', type: 'customEdge' },
        { id: 'e8', source: 'anim_write_formula', target: 'play_2', sourceHandle: 'out', targetHandle: 'animation', type: 'customEdge' }
      ]
    }
  }
];
