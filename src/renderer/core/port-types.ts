import type { DataType } from '@shared/node-types';

export const PORT_COLORS: Record<DataType, string> = {
  'Scene-Flow': '#eab308', // Amber / Gold
  'Mobject': '#10b981',    // Emerald
  'Animation': '#8b5cf6',  // Violet / Purple
  'Number': '#0ea5e9',     // Sky Blue
  'Vector3': '#f97316',    // Orange
  'Color': '#ec4899',      // Pink / Rose
  'String': '#94a3b8',     // Slate
  'Bool': '#06b6d4'        // Cyan
};

export const PORT_BG_COLORS: Record<DataType, string> = {
  'Scene-Flow': 'rgba(234, 179, 8, 0.15)',
  'Mobject': 'rgba(16, 185, 129, 0.15)',
  'Animation': 'rgba(139, 92, 246, 0.15)',
  'Number': 'rgba(14, 165, 233, 0.15)',
  'Vector3': 'rgba(249, 115, 22, 0.15)',
  'Color': 'rgba(236, 72, 153, 0.15)',
  'String': 'rgba(148, 163, 184, 0.15)',
  'Bool': 'rgba(6, 182, 212, 0.15)'
};

export function arePortsCompatible(sourceType: DataType, targetType: DataType): boolean {
  if (sourceType === targetType) return true;
  // Numbers can be formatted as strings
  if (sourceType === 'Number' && targetType === 'String') return true;
  // Mobjects can connect to Animation inputs (auto-wraps in Create(mobject))
  if (sourceType === 'Mobject' && targetType === 'Animation') return true;
  return false;
}
