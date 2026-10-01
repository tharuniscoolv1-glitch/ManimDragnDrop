import type { NodeDefinition } from '@shared/node-types';
import { formatColor, formatVector3 } from '../node-helpers';

export const mobjectNodes: NodeDefinition[] = [
  // Circle
  {
    id: 'mobject.circle',
    category: 'mobjects',
    label: 'Circle',
    description: 'A circular shape with radius and stroke/fill properties',
    inputs: [
      { id: 'radius', name: 'Radius', type: 'Number' },
      { id: 'color', name: 'Color', type: 'Color' }
    ],
    outputs: [
      { id: 'out', name: 'Mobject', type: 'Mobject' }
    ],
    params: [
      { id: 'radius', label: 'Radius', type: 'number', default: 1.5, min: 0.1, max: 10, step: 0.1 },
      { id: 'color', label: 'Color', type: 'color', default: '#3b82f6' },
      { id: 'fill_opacity', label: 'Fill Opacity', type: 'number', default: 0.5, min: 0, max: 1, step: 0.05 },
      { id: 'stroke_width', label: 'Stroke Width', type: 'number', default: 4, min: 0, max: 20, step: 0.5 }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('circle');
      const radius = ctx.inputVariableNames['radius'] ?? ctx.params.radius ?? 1.5;
      const color = ctx.inputVariableNames['color'] ? ctx.inputVariableNames['color'] : formatColor(ctx.params.color ?? '#3b82f6');
      const fillOpacity = ctx.params.fill_opacity ?? 0.5;
      const strokeWidth = ctx.params.stroke_width ?? 4;

      return {
        variableName: varName,
        declarationCode: [
          `${varName} = Circle(radius=${radius}, color=${color}, fill_opacity=${fillOpacity}, stroke_width=${strokeWidth})`
        ]
      };
    }
  },

  // Square
  {
    id: 'mobject.square',
    category: 'mobjects',
    label: 'Square',
    description: 'An equilateral quadrilateral with customizable side length',
    inputs: [
      { id: 'side_length', name: 'Side Length', type: 'Number' },
      { id: 'color', name: 'Color', type: 'Color' }
    ],
    outputs: [
      { id: 'out', name: 'Mobject', type: 'Mobject' }
    ],
    params: [
      { id: 'side_length', label: 'Side Length', type: 'number', default: 2.0, min: 0.1, max: 10, step: 0.1 },
      { id: 'color', label: 'Color', type: 'color', default: '#ef4444' },
      { id: 'fill_opacity', label: 'Fill Opacity', type: 'number', default: 0.5, min: 0, max: 1, step: 0.05 },
      { id: 'stroke_width', label: 'Stroke Width', type: 'number', default: 4, min: 0, max: 20, step: 0.5 }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('square');
      const side = ctx.inputVariableNames['side_length'] ?? ctx.params.side_length ?? 2.0;
      const color = ctx.inputVariableNames['color'] ? ctx.inputVariableNames['color'] : formatColor(ctx.params.color ?? '#ef4444');
      const fillOpacity = ctx.params.fill_opacity ?? 0.5;
      const strokeWidth = ctx.params.stroke_width ?? 4;

      return {
        variableName: varName,
        declarationCode: [
          `${varName} = Square(side_length=${side}, color=${color}, fill_opacity=${fillOpacity}, stroke_width=${strokeWidth})`
        ]
      };
    }
  },

  // Rectangle
  {
    id: 'mobject.rectangle',
    category: 'mobjects',
    label: 'Rectangle',
    description: 'A rectangle defined by width and height',
    inputs: [
      { id: 'width', name: 'Width', type: 'Number' },
      { id: 'height', name: 'Height', type: 'Number' },
      { id: 'color', name: 'Color', type: 'Color' }
    ],
    outputs: [
      { id: 'out', name: 'Mobject', type: 'Mobject' }
    ],
    params: [
      { id: 'width', label: 'Width', type: 'number', default: 3.0, min: 0.1, max: 15, step: 0.1 },
      { id: 'height', label: 'Height', type: 'number', default: 2.0, min: 0.1, max: 15, step: 0.1 },
      { id: 'color', label: 'Color', type: 'color', default: '#10b981' },
      { id: 'fill_opacity', label: 'Fill Opacity', type: 'number', default: 0.5, min: 0, max: 1, step: 0.05 },
      { id: 'stroke_width', label: 'Stroke Width', type: 'number', default: 4, min: 0, max: 20, step: 0.5 }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('rect');
      const width = ctx.inputVariableNames['width'] ?? ctx.params.width ?? 3.0;
      const height = ctx.inputVariableNames['height'] ?? ctx.params.height ?? 2.0;
      const color = ctx.inputVariableNames['color'] ? ctx.inputVariableNames['color'] : formatColor(ctx.params.color ?? '#10b981');
      const fillOpacity = ctx.params.fill_opacity ?? 0.5;
      const strokeWidth = ctx.params.stroke_width ?? 4;

      return {
        variableName: varName,
        declarationCode: [
          `${varName} = Rectangle(width=${width}, height=${height}, color=${color}, fill_opacity=${fillOpacity}, stroke_width=${strokeWidth})`
        ]
      };
    }
  },

  // Triangle
  {
    id: 'mobject.triangle',
    category: 'mobjects',
    label: 'Triangle',
    description: 'An equilateral regular triangle polygon',
    inputs: [
      { id: 'radius', name: 'Radius', type: 'Number' },
      { id: 'color', name: 'Color', type: 'Color' }
    ],
    outputs: [
      { id: 'out', name: 'Mobject', type: 'Mobject' }
    ],
    params: [
      { id: 'radius', label: 'Radius', type: 'number', default: 1.5, min: 0.1, max: 10, step: 0.1 },
      { id: 'color', label: 'Color', type: 'color', default: '#eab308' },
      { id: 'fill_opacity', label: 'Fill Opacity', type: 'number', default: 0.5, min: 0, max: 1, step: 0.05 }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('triangle');
      const radius = ctx.inputVariableNames['radius'] ?? ctx.params.radius ?? 1.5;
      const color = ctx.inputVariableNames['color'] ? ctx.inputVariableNames['color'] : formatColor(ctx.params.color ?? '#eab308');
      const fillOpacity = ctx.params.fill_opacity ?? 0.5;

      return {
        variableName: varName,
        declarationCode: [
          `${varName} = Triangle(radius=${radius}, color=${color}, fill_opacity=${fillOpacity})`
        ]
      };
    }
  },

  // Line
  {
    id: 'mobject.line',
    category: 'mobjects',
    label: 'Line',
    description: 'A straight line segment connecting two 3D points',
    inputs: [
      { id: 'start', name: 'Start', type: 'Vector3' },
      { id: 'end', name: 'End', type: 'Vector3' },
      { id: 'color', name: 'Color', type: 'Color' }
    ],
    outputs: [
      { id: 'out', name: 'Mobject', type: 'Mobject' }
    ],
    params: [
      { id: 'start', label: 'Start Point', type: 'vector3', default: [-2, 0, 0] },
      { id: 'end', label: 'End Point', type: 'vector3', default: [2, 0, 0] },
      { id: 'color', label: 'Color', type: 'color', default: '#ffffff' },
      { id: 'stroke_width', label: 'Stroke Width', type: 'number', default: 4, min: 1, max: 20, step: 0.5 }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('line');
      const start = ctx.inputVariableNames['start'] ?? formatVector3(ctx.params.start ?? [-2, 0, 0]);
      const end = ctx.inputVariableNames['end'] ?? formatVector3(ctx.params.end ?? [2, 0, 0]);
      const color = ctx.inputVariableNames['color'] ? ctx.inputVariableNames['color'] : formatColor(ctx.params.color ?? '#ffffff');
      const strokeWidth = ctx.params.stroke_width ?? 4;

      return {
        variableName: varName,
        declarationCode: [
          `${varName} = Line(start=${start}, end=${end}, color=${color}, stroke_width=${strokeWidth})`
        ]
      };
    }
  },

  // Arrow
  {
    id: 'mobject.arrow',
    category: 'mobjects',
    label: 'Arrow',
    description: 'A directional vector arrow with head pointer',
    inputs: [
      { id: 'start', name: 'Start', type: 'Vector3' },
      { id: 'end', name: 'End', type: 'Vector3' },
      { id: 'color', name: 'Color', type: 'Color' }
    ],
    outputs: [
      { id: 'out', name: 'Mobject', type: 'Mobject' }
    ],
    params: [
      { id: 'start', label: 'Start Point', type: 'vector3', default: [-2, 0, 0] },
      { id: 'end', label: 'End Point', type: 'vector3', default: [2, 0, 0] },
      { id: 'color', label: 'Color', type: 'color', default: '#38bdf8' },
      { id: 'buff', label: 'Buffer', type: 'number', default: 0, min: 0, max: 5, step: 0.1 }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('arrow');
      const start = ctx.inputVariableNames['start'] ?? formatVector3(ctx.params.start ?? [-2, 0, 0]);
      const end = ctx.inputVariableNames['end'] ?? formatVector3(ctx.params.end ?? [2, 0, 0]);
      const color = ctx.inputVariableNames['color'] ? ctx.inputVariableNames['color'] : formatColor(ctx.params.color ?? '#38bdf8');
      const buff = ctx.params.buff ?? 0;

      return {
        variableName: varName,
        declarationCode: [
          `${varName} = Arrow(start=${start}, end=${end}, color=${color}, buff=${buff})`
        ]
      };
    }
  },

  // Dot
  {
    id: 'mobject.dot',
    category: 'mobjects',
    label: 'Dot',
    description: 'A small filled circle representing a coordinate point',
    inputs: [
      { id: 'point', name: 'Point', type: 'Vector3' },
      { id: 'color', name: 'Color', type: 'Color' }
    ],
    outputs: [
      { id: 'out', name: 'Mobject', type: 'Mobject' }
    ],
    params: [
      { id: 'point', label: 'Point', type: 'vector3', default: [0, 0, 0] },
      { id: 'radius', label: 'Radius', type: 'number', default: 0.12, min: 0.02, max: 2, step: 0.02 },
      { id: 'color', label: 'Color', type: 'color', default: '#f43f5e' }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('dot');
      const point = ctx.inputVariableNames['point'] ?? formatVector3(ctx.params.point ?? [0, 0, 0]);
      const radius = ctx.params.radius ?? 0.12;
      const color = ctx.inputVariableNames['color'] ? ctx.inputVariableNames['color'] : formatColor(ctx.params.color ?? '#f43f5e');

      return {
        variableName: varName,
        declarationCode: [
          `${varName} = Dot(point=${point}, radius=${radius}, color=${color})`
        ]
      };
    }
  },

  // Text
  {
    id: 'mobject.text',
    category: 'mobjects',
    label: 'Text',
    description: 'A plain text string rendered without LaTeX dependency',
    inputs: [
      { id: 'text', name: 'Text', type: 'String' },
      { id: 'color', name: 'Color', type: 'Color' }
    ],
    outputs: [
      { id: 'out', name: 'Mobject', type: 'Mobject' }
    ],
    params: [
      { id: 'text', label: 'Text', type: 'string', default: 'Hello Manim' },
      { id: 'font_size', label: 'Font Size', type: 'number', default: 44, min: 10, max: 120, step: 2 },
      { id: 'color', label: 'Color', type: 'color', default: '#ffffff' }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('text');
      const rawText = ctx.inputVariableNames['text'] ? `str(${ctx.inputVariableNames['text']})` : JSON.stringify(ctx.params.text || 'Hello Manim');
      const fontSize = ctx.params.font_size ?? 44;
      const color = ctx.inputVariableNames['color'] ? ctx.inputVariableNames['color'] : formatColor(ctx.params.color ?? '#ffffff');

      return {
        variableName: varName,
        declarationCode: [
          `${varName} = Text(${rawText}, font_size=${fontSize}, color=${color})`
        ]
      };
    }
  },

  // MathTex (LaTeX)
  {
    id: 'mobject.mathtex',
    category: 'mobjects',
    label: 'MathTex / LaTeX',
    description: 'LaTeX mathematical formula (requires LaTeX system installation)',
    requiresLatex: true,
    inputs: [
      { id: 'color', name: 'Color', type: 'Color' }
    ],
    outputs: [
      { id: 'out', name: 'Mobject', type: 'Mobject' }
    ],
    params: [
      { id: 'latex', label: 'LaTeX Expression', type: 'text', default: 'e^{i\\pi} + 1 = 0' },
      { id: 'font_size', label: 'Font Size', type: 'number', default: 48, min: 10, max: 140, step: 2 },
      { id: 'color', label: 'Color', type: 'color', default: '#ffffff' }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('tex');
      const latex = ctx.params.latex || 'e^{i\\pi} + 1 = 0';
      const fontSize = ctx.params.font_size ?? 48;
      const color = ctx.inputVariableNames['color'] ? ctx.inputVariableNames['color'] : formatColor(ctx.params.color ?? '#ffffff');

      return {
        variableName: varName,
        declarationCode: [
          `${varName} = MathTex(r"""${latex}""", font_size=${fontSize}, color=${color})`
        ]
      };
    }
  },

  // Axes
  {
    id: 'mobject.axes',
    category: 'mobjects',
    label: 'Axes',
    description: 'A 2D coordinate system with customizable ranges and dimensions',
    inputs: [],
    outputs: [
      { id: 'out', name: 'Axes', type: 'Mobject' }
    ],
    params: [
      { id: 'x_min', label: 'X Min', type: 'number', default: -5, step: 1 },
      { id: 'x_max', label: 'X Max', type: 'number', default: 5, step: 1 },
      { id: 'x_step', label: 'X Step', type: 'number', default: 1, step: 0.5 },
      { id: 'y_min', label: 'Y Min', type: 'number', default: -3, step: 1 },
      { id: 'y_max', label: 'Y Max', type: 'number', default: 3, step: 1 },
      { id: 'y_step', label: 'Y Step', type: 'number', default: 1, step: 0.5 },
      { id: 'x_length', label: 'X Length', type: 'number', default: 9, min: 2, max: 16, step: 0.5 },
      { id: 'y_length', label: 'Y Length', type: 'number', default: 5.5, min: 2, max: 12, step: 0.5 },
      { id: 'tips', label: 'Include Arrow Tips', type: 'boolean', default: true }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('axes');
      const p = ctx.params;
      const xRange = `[${p.x_min ?? -5}, ${p.x_max ?? 5}, ${p.x_step ?? 1}]`;
      const yRange = `[${p.y_min ?? -3}, ${p.y_max ?? 3}, ${p.y_step ?? 1}]`;
      const xLength = p.x_length ?? 9;
      const yLength = p.y_length ?? 5.5;
      const tips = p.tips !== false ? 'True' : 'False';

      return {
        variableName: varName,
        declarationCode: [
          `${varName} = Axes(x_range=${xRange}, y_range=${yRange}, x_length=${xLength}, y_length=${yLength}, tips=${tips})`
        ]
      };
    }
  },

  // NumberPlane
  {
    id: 'mobject.numberplane',
    category: 'mobjects',
    label: 'Number Plane',
    description: 'A Cartesian grid with coordinate lines and axes',
    inputs: [],
    outputs: [
      { id: 'out', name: 'Mobject', type: 'Mobject' }
    ],
    params: [
      { id: 'x_min', label: 'X Min', type: 'number', default: -7 },
      { id: 'x_max', label: 'X Max', type: 'number', default: 7 },
      { id: 'y_min', label: 'Y Min', type: 'number', default: -4 },
      { id: 'y_max', label: 'Y Max', type: 'number', default: 4 },
      { id: 'opacity', label: 'Grid Opacity', type: 'number', default: 0.35, min: 0.05, max: 1, step: 0.05 }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('plane');
      const p = ctx.params;
      const op = p.opacity ?? 0.35;
      return {
        variableName: varName,
        declarationCode: [
          `${varName} = NumberPlane(x_range=[${p.x_min ?? -7}, ${p.x_max ?? 7}, 1], y_range=[${p.y_min ?? -4}, ${p.y_max ?? 4}, 1], background_line_style={"stroke_opacity": ${op}})`
        ]
      };
    }
  },

  // Graph Plot
  {
    id: 'mobject.graphplot',
    category: 'mobjects',
    label: 'Graph Plot',
    description: 'Plots a mathematical function curve on connected Axes',
    inputs: [
      { id: 'axes', name: 'Axes', type: 'Mobject', required: true }
    ],
    outputs: [
      { id: 'out', name: 'Graph', type: 'Mobject' }
    ],
    params: [
      { id: 'function_expr', label: 'Function Expression (e.g. np.sin(x))', type: 'string', default: 'np.sin(x)' },
      { id: 'x_min', label: 'X Min', type: 'number', default: -4, step: 0.5 },
      { id: 'x_max', label: 'X Max', type: 'number', default: 4, step: 0.5 },
      { id: 'color', label: 'Color', type: 'color', default: '#38bdf8' }
    ],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('graph');
      const axesVar = ctx.inputVariableNames['axes'] || 'axes';
      const fnExpr = ctx.params.function_expr || 'np.sin(x)';
      const xMin = ctx.params.x_min ?? -4;
      const xMax = ctx.params.x_max ?? 4;
      const color = formatColor(ctx.params.color ?? '#38bdf8');

      return {
        variableName: varName,
        declarationCode: [
          `${varName} = ${axesVar}.plot(lambda x: ${fnExpr}, x_range=[${xMin}, ${xMax}], color=${color})`
        ]
      };
    }
  },

  // VGroup
  {
    id: 'mobject.vgroup',
    category: 'mobjects',
    label: 'VGroup',
    description: 'Groups multiple vector mobjects together into a single collective unit',
    inputs: [
      { id: 'items', name: 'Mobjects', type: 'Mobject', allowMultipleConnections: true }
    ],
    outputs: [
      { id: 'out', name: 'Group', type: 'Mobject' }
    ],
    params: [],
    codegen: (ctx) => {
      const varName = ctx.allocateVariable('group');
      const items = ctx.inputVariableNames['items'] || '';
      return {
        variableName: varName,
        declarationCode: [
          `${varName} = VGroup(${items})`
        ]
      };
    }
  }
];
