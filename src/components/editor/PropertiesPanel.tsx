import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Type, Palette, Layout, Settings, Eye, EyeOff, 
  Copy, Trash2, RotateCcw, Save 
} from 'lucide-react';

interface Component {
  id: string;
  project_id: string;
  component_type: string;
  content: Record<string, any>;
  position: number;
  styles?: Record<string, any>;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

interface PropertiesPanelProps {
  selectedComponent: Component | null;
  onUpdateComponent: (componentId: string, updates: Partial<Component>) => void;
  onDeleteComponent: (componentId: string) => void;
}

export default function PropertiesPanel({
  selectedComponent,
  onUpdateComponent,
  onDeleteComponent
}: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'styles' | 'attributes'>('content');
  const [localContent, setLocalContent] = useState<any>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (selectedComponent) {
      setLocalContent(selectedComponent.content || {});
      setHasChanges(false);
    }
  }, [selectedComponent]);

  const handleContentChange = (key: string, value: any) => {
    const newContent = { ...localContent, [key]: value };
    setLocalContent(newContent);
    setHasChanges(true);
  };

  const handleStyleChange = (property: string, value: string) => {
    const newStyles = { 
      ...localContent.styles, 
      [property]: value 
    };
    handleContentChange('styles', newStyles);
  };

  const handleAttributeChange = (attribute: string, value: string) => {
    const newAttributes = { 
      ...localContent.attributes, 
      [attribute]: value 
    };
    handleContentChange('attributes', newAttributes);
  };

  const saveChanges = () => {
    if (selectedComponent && hasChanges) {
      onUpdateComponent(selectedComponent.id, {
        content: localContent
      });
      setHasChanges(false);
    }
  };

  const resetChanges = () => {
    if (selectedComponent) {
      setLocalContent(selectedComponent.content || {});
      setHasChanges(false);
    }
  };

  const handleDelete = () => {
    if (selectedComponent && confirm('Are you sure you want to delete this component?')) {
      onDeleteComponent(selectedComponent.id);
    }
  };

  const toggleVisibility = () => {
    if (selectedComponent) {
      onUpdateComponent(selectedComponent.id, {
        is_visible: !selectedComponent.is_visible
      });
    }
  };

  if (!selectedComponent) {
    return (
      <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Properties</h3>
        </div>
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="text-center text-gray-500">
            <Settings className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p className="text-sm">Select a component to edit its properties</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-white border-l border-gray-200 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-gray-900">Properties</h3>
          <div className="flex items-center space-x-1">
            <button
              onClick={toggleVisibility}
              className={`p-1 rounded ${selectedComponent.is_visible ? 'text-gray-600' : 'text-red-500'}`}
              title={selectedComponent.is_visible ? 'Hide component' : 'Show component'}
            >
              {selectedComponent.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Delete component"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
        
        <div className="text-xs text-gray-500 mb-3">
          <div className="font-medium">{selectedComponent.component_type}</div>
          <div>Tag: {localContent.tag}</div>
          {localContent.selector && <div>Selector: {localContent.selector}</div>}
        </div>

        {/* Tab Navigation */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('content')}
            className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
              activeTab === 'content' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            <Type className="h-3 w-3" />
            <span>Content</span>
          </button>
          <button
            onClick={() => setActiveTab('styles')}
            className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
              activeTab === 'styles' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            <Palette className="h-3 w-3" />
            <span>Styles</span>
          </button>
          <button
            onClick={() => setActiveTab('attributes')}
            className={`flex-1 flex items-center justify-center space-x-1 px-3 py-2 rounded text-xs font-medium transition-colors ${
              activeTab === 'attributes' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600'
            }`}
          >
            <Layout className="h-3 w-3" />
            <span>Attrs</span>
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'content' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Text Content
              </label>
              <textarea
                value={localContent.content || ''}
                onChange={(e) => handleContentChange('content', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                rows={4}
                placeholder="Component content..."
              />
            </div>

            {localContent.tag === 'img' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Image Source
                </label>
                <input
                  type="url"
                  value={localContent.attributes?.src || ''}
                  onChange={(e) => handleAttributeChange('src', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  placeholder="https://example.com/image.jpg"
                />
              </div>
            )}

            {localContent.tag === 'a' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Link URL
                </label>
                <input
                  type="url"
                  value={localContent.attributes?.href || ''}
                  onChange={(e) => handleAttributeChange('href', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  placeholder="https://example.com"
                />
              </div>
            )}
          </div>
        )}

        {activeTab === 'styles' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Background
                </label>
                <input
                  type="color"
                  value={localContent.styles?.backgroundColor || '#ffffff'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Text Color
                </label>
                <input
                  type="color"
                  value={localContent.styles?.color || '#000000'}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="w-full h-8 border border-gray-300 rounded"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Font Size
              </label>
              <input
                type="text"
                value={localContent.styles?.fontSize || ''}
                onChange={(e) => handleStyleChange('fontSize', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="16px"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Font Family
              </label>
              <select
                value={localContent.styles?.fontFamily || ''}
                onChange={(e) => handleStyleChange('fontFamily', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
              >
                <option value="">Default</option>
                <option value="Arial, sans-serif">Arial</option>
                <option value="Helvetica, sans-serif">Helvetica</option>
                <option value="Georgia, serif">Georgia</option>
                <option value="Times New Roman, serif">Times New Roman</option>
                <option value="Courier, monospace">Courier</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Padding
                </label>
                <input
                  type="text"
                  value={localContent.styles?.padding || ''}
                  onChange={(e) => handleStyleChange('padding', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  placeholder="16px"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Margin
                </label>
                <input
                  type="text"
                  value={localContent.styles?.margin || ''}
                  onChange={(e) => handleStyleChange('margin', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  placeholder="8px"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Border
              </label>
              <input
                type="text"
                value={localContent.styles?.border || ''}
                onChange={(e) => handleStyleChange('border', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="1px solid #ccc"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Border Radius
              </label>
              <input
                type="text"
                value={localContent.styles?.borderRadius || ''}
                onChange={(e) => handleStyleChange('borderRadius', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="4px"
              />
            </div>
          </div>
        )}

        {activeTab === 'attributes' && (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                ID
              </label>
              <input
                type="text"
                value={localContent.attributes?.id || ''}
                onChange={(e) => handleAttributeChange('id', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="element-id"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Class
              </label>
              <input
                type="text"
                value={localContent.attributes?.class || ''}
                onChange={(e) => handleAttributeChange('class', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="class-name another-class"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                value={localContent.attributes?.title || ''}
                onChange={(e) => handleAttributeChange('title', e.target.value)}
                className="w-full p-2 border border-gray-300 rounded text-sm"
                placeholder="Tooltip text"
              />
            </div>

            {localContent.tag === 'img' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Alt Text
                </label>
                <input
                  type="text"
                  value={localContent.attributes?.alt || ''}
                  onChange={(e) => handleAttributeChange('alt', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                  placeholder="Image description"
                />
              </div>
            )}

            {localContent.tag === 'a' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Target
                </label>
                <select
                  value={localContent.attributes?.target || ''}
                  onChange={(e) => handleAttributeChange('target', e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded text-sm"
                >
                  <option value="">Same window</option>
                  <option value="_blank">New window</option>
                  <option value="_parent">Parent frame</option>
                  <option value="_top">Top frame</option>
                </select>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer */}
      {hasChanges && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t border-gray-200 p-4 bg-gray-50"
        >
          <div className="flex space-x-2">
            <button
              onClick={saveChanges}
              className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm font-medium hover:bg-blue-700 transition-colors flex items-center justify-center space-x-1"
            >
              <Save className="h-3 w-3" />
              <span>Save</span>
            </button>
            <button
              onClick={resetChanges}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded text-sm hover:bg-gray-50 transition-colors"
              title="Reset changes"
            >
              <RotateCcw className="h-3 w-3" />
            </button>
          </div>
        </motion.div>
      )}
    </div>
  );
}