import React from 'react';
import { Code, Palette } from 'lucide-react';

// Fixed JSX compilation issue - cache cleared

interface EditorModeSelectorProps {
  mode: 'visual' | 'code';
  onModeChange: (mode: 'visual' | 'code') => void;
}

const EditorModeSelector: React.FC<EditorModeSelectorProps> = ({
  mode,
  onModeChange
}) => {
  return (
    <div className="flex items-center bg-gray-100 rounded-lg p-1 shadow-sm">
      <button
        onClick={() => onModeChange('visual')}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          mode === 'visual'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Palette className="h-4 w-4" />
        <span>Visual Editor</span>
      </button>
      
      <button
        onClick={() => onModeChange('code')}
        className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
          mode === 'code'
            ? 'bg-white text-blue-600 shadow-sm'
            : 'text-gray-600 hover:text-gray-900'
        }`}
      >
        <Code className="h-4 w-4" />
        <span>Code Editor</span>
      </button>
    </div>
  );
};

export default EditorModeSelector;