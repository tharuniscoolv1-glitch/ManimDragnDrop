import React, { useState } from 'react';
import { PropertiesPanel } from './PropertiesPanel';
import { CodePanel } from './CodePanel';
import { LogPanel } from './LogPanel';
import { Sliders, Code2, Terminal } from 'lucide-react';
import { useRenderStore } from '../../store/render-store';
import { useGraphStore } from '../../store/graph-store';

export type RightPanelTab = 'properties' | 'code' | 'log';

export const RightPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RightPanelTab>('properties');
  const renderStatus = useRenderStore((s) => s.status);
  const compileResult = useGraphStore((s) => s.compileResult);

  const errorCount = compileResult?.errors.length || 0;
  const isRendering = renderStatus === 'rendering';

  return (
    <div className="w-80 lg:w-96 h-full bg-dark-850 border-l border-dark-700 flex flex-col flex-shrink-0 select-none">
      {/* Tab Navigation */}
      <div className="flex items-center border-b border-dark-700 bg-dark-800">
        <button
          onClick={() => setActiveTab('properties')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer ${
            activeTab === 'properties'
              ? 'border-blue-500 text-blue-400 bg-dark-850'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sliders size={13} />
          <span>Properties</span>
        </button>

        <button
          onClick={() => setActiveTab('code')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer relative ${
            activeTab === 'code'
              ? 'border-blue-500 text-blue-400 bg-dark-850'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code2 size={13} />
          <span>Code</span>
          {errorCount > 0 && (
            <span className="w-2 h-2 rounded-full bg-red-500 absolute top-2 right-4" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('log')}
          className={`flex-1 flex items-center justify-center space-x-1.5 py-2.5 text-xs font-semibold border-b-2 transition-colors cursor-pointer relative ${
            activeTab === 'log'
              ? 'border-blue-500 text-blue-400 bg-dark-850'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal size={13} />
          <span>Log</span>
          {isRendering && (
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse absolute top-2 right-4" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'properties' && <PropertiesPanel />}
        {activeTab === 'code' && <CodePanel />}
        {activeTab === 'log' && <LogPanel />}
      </div>
    </div>
  );
};
