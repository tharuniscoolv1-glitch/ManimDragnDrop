import React, { useState } from 'react';
import {
  getAllNodeDefinitions,
  CATEGORY_LABELS,
  CATEGORY_COLORS
} from '../../core/node-registry';
import { useGraphStore } from '../../store/graph-store';
import type { NodeCategory } from '@shared/node-types';
import {
  Search,
  ChevronDown,
  ChevronRight,
  Plus,
  Layers,
  Shapes,
  PlayCircle,
  Sliders,
  Sparkles,
  Camera,
  Hash
} from 'lucide-react';

const CATEGORY_ICONS: Record<NodeCategory, React.ReactNode> = {
  scene: <Layers size={14} />,
  mobjects: <Shapes size={14} />,
  animations: <Sparkles size={14} />,
  composition: <PlayCircle size={14} />,
  modifiers: <Sliders size={14} />,
  values: <Hash size={14} />,
  camera: <Camera size={14} />
};

export const NodePalette: React.FC = () => {
  const [search, setSearch] = useState('');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const addNode = useGraphStore((s) => s.addNode);

  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  const allNodes = getAllNodeDefinitions();

  const filteredNodes = allNodes.filter((node) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      node.label.toLowerCase().includes(q) ||
      node.description.toLowerCase().includes(q) ||
      CATEGORY_LABELS[node.category].toLowerCase().includes(q)
    );
  });

  const categories: NodeCategory[] = [
    'scene',
    'mobjects',
    'animations',
    'composition',
    'modifiers',
    'values',
    'camera'
  ];

  const handleDoubleClick = (defId: string) => {
    // Add to center canvas roughly
    addNode(defId, { x: 400 + Math.random() * 50, y: 250 + Math.random() * 50 });
  };

  const handleDragStart = (e: React.DragEvent, defId: string) => {
    e.dataTransfer.setData('application/manim-node-id', defId);
    e.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div className="w-64 h-full bg-dark-850 border-r border-dark-700 flex flex-col flex-shrink-0 select-none">
      {/* Search Header */}
      <div className="p-3 border-b border-dark-700 bg-dark-800">
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-2.5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search nodes..."
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-dark-900 border border-dark-700 rounded-md text-slate-200 placeholder-slate-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>

      {/* Nodes list grouped by category */}
      <div className="flex-1 overflow-y-auto p-2 space-y-3">
        {categories.map((cat) => {
          const categoryNodes = filteredNodes.filter((n) => n.category === cat);
          if (categoryNodes.length === 0) return null;

          const isCollapsed = !!collapsedCategories[cat];
          const catColor = CATEGORY_COLORS[cat] || '#3b82f6';

          return (
            <div key={cat} className="space-y-1">
              {/* Category Header */}
              <button
                onClick={() => toggleCategory(cat)}
                className="w-full flex items-center justify-between px-2 py-1.5 rounded hover:bg-dark-800 text-xs font-semibold text-slate-300 transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2">
                  <span style={{ color: catColor }}>{CATEGORY_ICONS[cat]}</span>
                  <span>{CATEGORY_LABELS[cat]}</span>
                  <span className="text-[10px] text-slate-400 px-1.5 py-0.2 bg-dark-750 rounded-full font-mono">
                    {categoryNodes.length}
                  </span>
                </div>
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
              </button>

              {/* Node Items */}
              {!isCollapsed && (
                <div className="space-y-1 pl-1">
                  {categoryNodes.map((node) => (
                    <div
                      key={node.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, node.id)}
                      onDoubleClick={() => handleDoubleClick(node.id)}
                      title={`${node.description}\n(Double-click or drag onto canvas)`}
                      className="group flex items-center justify-between px-2.5 py-1.5 bg-dark-900/80 hover:bg-dark-800 border border-dark-700 hover:border-dark-600 rounded cursor-grab active:cursor-grabbing transition-all text-xs"
                    >
                      <div className="flex items-center space-x-2 truncate">
                        <span
                          className="w-2 h-2 rounded-full flex-shrink-0"
                          style={{ backgroundColor: catColor }}
                        />
                        <span className="truncate text-slate-200 group-hover:text-white font-medium">
                          {node.label}
                        </span>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDoubleClick(node.id);
                        }}
                        title="Add to canvas"
                        className="opacity-0 group-hover:opacity-100 p-0.5 text-slate-400 hover:text-blue-400 transition-opacity"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
