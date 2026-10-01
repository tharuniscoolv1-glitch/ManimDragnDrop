export interface CompileIssue {
  nodeId?: string;
  portId?: string;
  message: string;
  type: 'error' | 'warning';
}

export interface CompileResult {
  success: boolean;
  pythonCode: string;
  sceneClassName: string;
  errors: CompileIssue[];
  warnings: CompileIssue[];
  activeMobjects: string[];
}
