export type DataType =
  | 'Scene-Flow' // Execution sequencing (gold)
  | 'Mobject'    // Geometry / Tex / Groups (green)
  | 'Animation'  // Transform / Create / Fade (purple)
  | 'Number'     // Scalars / Floats (sky blue)
  | 'Vector3'    // [x, y, z] coordinates (orange)
  | 'Color'      // Manim color / hex (pink)
  | 'String'     // Text literals (slate)
  | 'Bool';      // Flags (amber)

export interface PortDefinition {
  id: string;
  name: string;
  type: DataType;
  description?: string;
  allowMultipleConnections?: boolean; // Defaults: true for outputs, false for inputs
  required?: boolean;
}

export type ParamType =
  | 'number'
  | 'string'
  | 'text'
  | 'color'
  | 'vector3'
  | 'boolean'
  | 'select';

export interface ParamOption {
  label: string;
  value: string | number | boolean;
}

export interface ParamDefinition {
  id: string;
  label: string;
  type: ParamType;
  default: any;
  min?: number;
  max?: number;
  step?: number;
  options?: ParamOption[];
  description?: string;
}

export type NodeCategory =
  | 'scene'
  | 'mobjects'
  | 'animations'
  | 'composition'
  | 'modifiers'
  | 'values'
  | 'camera';

export interface CodegenContext {
  nodeId: string;
  params: Record<string, any>;
  inputVariableNames: Record<string, string>; // portId -> variable/expression name
  allocateVariable: (prefix: string) => string;
  allocateHelperFunction?: (fnDef: string) => string;
}

export interface CodegenOutput {
  variableName?: string;             // Mobject or Animation or Value variable
  declarationCode?: string[];        // Variable instantiation (e.g., circle_1 = Circle(...))
  actionCode?: string[];             // Code inside construct(self) (e.g., self.play(...))
}

export interface NodeDefinition {
  id: string;
  category: NodeCategory;
  label: string;
  description: string;
  inputs: PortDefinition[];
  outputs: PortDefinition[];
  params: ParamDefinition[];
  requiresLatex?: boolean;
  codegen: (ctx: CodegenContext) => CodegenOutput;
}
