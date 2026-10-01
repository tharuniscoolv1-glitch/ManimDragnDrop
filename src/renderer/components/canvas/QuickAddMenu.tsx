import React, { useState, useEffect, useRef } from 'react';
import { getAllNodeDefinitions, CATEGORY_LABELS, CATEGORY_COLORS } from '../../core/node-registry';
import { useGraphStore } from '../../store/graph-store';
import { Search } from 'lucide-react';

interface QuickAddMenuProps {
  position: { x: number; y: number };
  canvasPosition: { x: number; y: number };
  onClose: () => void;
}

export const QuickAddMenu: React.FC<QuickAddMenuProps> = ({
  position,
  canvasPosition,
  onClose
}) => {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const addNode = useGraphStore((s) => s.addNode);

  const allNodes = getAllNodeDefinitions().filter((n) => n.id !== 'scene.root');
  const filteredNodes = allNodes.filter(
    (n) =>
      n.label.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase()) ||
      CATEGORY_LABELS[n.category].toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const handleSelect = (defId: string) => {
    addNode(defId, canvasPosition);
    onClose();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredNodes.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredNodes.length) % Math.max(1, filteredNodes.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredNodes[selectedIndex]) {
        handleSelect(filteredNodes[selectedIndex].id);
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  return (
    <div
      className="fixed z-50 w-72 bg-dark-850 border border-dark-700 rounded-lg shadow-2xl overflow-hidden text-slate-200"
      style={{ left: position.x, top: position.y }}
      onKeyDown={handleKeyDown}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-center px-3 py-2 border-b border-dark-700 bg-dark-800">
        <Search size={14} className="text-slate-400 mr-2 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Add node (e.g. Circle, Create, Play)..."
          className="w-full bg-transparent text-xs text-slate-100 placeholder-slate-400 focus:outline-none"
        />
      </div>

      <div className="max-h-64 overflow-y-auto py-1">
        {filteredNodes.length === 0 ? (
          <div className="p-3 text-center text-xs text-slate-400">No matching nodes found</div>
        ) : (
          filteredNodes.map((node, idx) => {
            const isSelected = idx === selectedIndex;
            const catColor = CATEGORY_COLORS[node.category] || '#64748b';
            return (
              <div
                key={node.id}
                onClick={() => handleSelect(node.id)}
                onMouseEnter={() => setSelectedIndex(idx)}
                className={`flex items-center px-3 py-1.5 cursor-pointer text-xs transition-colors ${
                  isSelected ? 'bg-blue-600/30 text-white' : 'text-slate-300 hover:bg-dark-800'
                }`}
              >
                <span
                  className="w-2 h-2 rounded-full mr-2 flex-shrink-0"
                  style={{ backgroundColor: catColor }}
                />
                <span className="font-medium mr-2">{node.label}</span>
                <span className="text-[10px] text-slate-400 ml-auto truncate max-w-[90px]">
                  {CATEGORY_LABELS[node.category]}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
