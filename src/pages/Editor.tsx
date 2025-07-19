import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Save, Eye, Code, Smartphone, Tablet, Monitor, 
  Settings, Layers, Palette, Type, Image, Link, MousePointer,
  Undo, Redo, Download, Share, Wand2
} from "lucide-react";
import { projectsApi, componentsApi } from "../lib/api";
import { toast } from "sonner";

// Types for the editor
interface EditorComponent {
  id: string;
  type: string;
  tag: string;
  content?: string;
  styles: Record<string, any>;
  attributes: Record<string, any>;
  selector: string;
  position: { x: number; y: number; width: number; height: number };
  children?: EditorComponent[];
}

interface Project {
  id: string;
  title: string;
  description?: string;
  site_url?: string;
  framework?: {
    framework: string;
    version?: string;
    confidence: number;
  };
}

const Editor = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [project, setProject] = useState<Project | null>(null);
  const [components, setComponents] = useState<EditorComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<EditorComponent | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [sidebarTab, setSidebarTab] = useState<'layers' | 'properties' | 'styles'>('layers');
  const [showCode, setShowCode] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadComponents();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const data = await projectsApi.getProject(projectId!);
      if (data.data) {
        setProject(data.data);
      }
    } catch (error) {
      console.error("Failed to load project:", error);
      toast.error("Failed to load project");
    }
  };

  const loadComponents = async () => {
    try {
      setLoading(true);
      const data = await componentsApi.getComponents(projectId!);
      if (data.data) {
        // Transform database components to editor format
        const editorComponents = data.data.map(comp => ({
          id: comp.id,
          type: comp.component_type,
          tag: comp.content.tag || 'div',
          content: comp.content.content || '',
          styles: comp.content.styles || {},
          attributes: comp.content.attributes || {},
          selector: comp.content.selector || '',
          position: comp.content.position || { x: 0, y: 0, width: 100, height: 50 }
        }));
        setComponents(editorComponents);
      }
    } catch (error) {
      console.error("Failed to load components:", error);
      toast.error("Failed to load components");
    } finally {
      setLoading(false);
    }
  };

  const handleIframeLoad = () => {
    setIframeLoaded(true);
    
    if (iframeRef.current && project?.site_url) {
      try {
        const iframeDoc = iframeRef.current.contentDocument;
        if (iframeDoc) {
          // Inject click handlers for component selection
          injectComponentSelectors(iframeDoc);
        }
      } catch (error) {
        console.error("Cannot access iframe content due to CORS:", error);
        // Fallback: show manual component selection
      }
    }
  };

  const injectComponentSelectors = (doc: Document) => {
    // Add styles for highlighting
    const style = doc.createElement('style');
    style.textContent = `
      .ai-editor-highlight {
        outline: 2px solid #3b82f6 !important;
        outline-offset: 2px !important;
        cursor: pointer !important;
        position: relative !important;
      }
      .ai-editor-highlight::after {
        content: attr(data-component-type);
        position: absolute;
        top: -24px;
        left: 0;
        background: #3b82f6;
        color: white;
        padding: 2px 6px;
        font-size: 12px;
        border-radius: 3px;
        z-index: 10000;
      }
      .ai-editor-selected {
        outline: 2px solid #10b981 !important;
        outline-offset: 2px !important;
      }
    `;
    doc.head.appendChild(style);

    // Add hover and click handlers to all elements
    const allElements = doc.querySelectorAll('*');
    allElements.forEach((element, index) => {
      if (element.tagName !== 'SCRIPT' && element.tagName !== 'STYLE') {
        element.addEventListener('mouseenter', () => {
          element.classList.add('ai-editor-highlight');
          element.setAttribute('data-component-type', element.tagName.toLowerCase());
        });

        element.addEventListener('mouseleave', () => {
          element.classList.remove('ai-editor-highlight');
        });

        element.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          
          // Remove previous selection
          doc.querySelectorAll('.ai-editor-selected').forEach(el => {
            el.classList.remove('ai-editor-selected');
          });
          
          // Add selection to clicked element
          element.classList.add('ai-editor-selected');
          
          // Create component data from element
          const rect = element.getBoundingClientRect();
          const styles = window.getComputedStyle(element);
          
          const componentData: EditorComponent = {
            id: `element-${index}`,
            type: getComponentType(element.tagName.toLowerCase()),
            tag: element.tagName.toLowerCase(),
            content: element.textContent?.trim() || '',
            styles: {
              backgroundColor: styles.backgroundColor,
              color: styles.color,
              fontSize: styles.fontSize,
              fontFamily: styles.fontFamily,
              padding: styles.padding,
              margin: styles.margin,
              border: styles.border,
              borderRadius: styles.borderRadius,
              display: styles.display,
              position: styles.position,
              width: styles.width,
              height: styles.height
            },
            attributes: Array.from(element.attributes).reduce((acc, attr) => {
              acc[attr.name] = attr.value;
              return acc;
            }, {} as Record<string, any>),
            selector: generateSelector(element),
            position: {
              x: rect.left,
              y: rect.top,
              width: rect.width,
              height: rect.height
            }
          };
          
          setSelectedComponent(componentData);
          setSidebarTab('properties');
        });
      }
    });
  };

  const getComponentType = (tagName: string): string => {
    const typeMap: Record<string, string> = {
      'header': 'header',
      'nav': 'navigation',
      'footer': 'footer',
      'section': 'section',
      'article': 'article',
      'h1': 'heading', 'h2': 'heading', 'h3': 'heading', 'h4': 'heading', 'h5': 'heading', 'h6': 'heading',
      'p': 'paragraph',
      'img': 'image',
      'a': 'link',
      'button': 'button',
      'input': 'form-element',
      'textarea': 'form-element',
      'select': 'form-element',
      'form': 'form',
      'ul': 'list',
      'ol': 'list',
      'div': 'container',
      'span': 'text'
    };
    return typeMap[tagName] || 'element';
  };

  const generateSelector = (element: Element): string => {
    if (element.id) return `#${element.id}`;
    if (element.className) {
      const classes = element.className.split(' ').filter(c => c.trim());
      if (classes.length > 0) return `.${classes[0]}`;
    }
    return element.tagName.toLowerCase();
  };

  const updateComponentProperty = (property: string, value: any) => {
    if (!selectedComponent) return;

    const updatedComponent = {
      ...selectedComponent,
      [property]: value
    };

    if (property === 'styles') {
      updatedComponent.styles = { ...selectedComponent.styles, ...value };
    }

    setSelectedComponent(updatedComponent);
    
    // Apply changes to iframe if possible
    applyChangesToIframe(updatedComponent);
  };

  const applyChangesToIframe = (component: EditorComponent) => {
    if (!iframeRef.current) return;
    
    try {
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc) {
        const element = iframeDoc.querySelector('.ai-editor-selected');
        if (element) {
          // Apply style changes
          Object.entries(component.styles).forEach(([property, value]) => {
            (element as HTMLElement).style.setProperty(property, value);
          });
          
          // Apply content changes
          if (component.content && element.textContent !== component.content) {
            element.textContent = component.content;
          }
        }
      }
    } catch (error) {
      console.error("Cannot modify iframe content:", error);
    }
  };

  const saveChanges = async () => {
    if (!selectedComponent || !projectId) return;
    
    try {
      setSaving(true);
      
      // Save component changes to database
      await componentsApi.updateComponent(selectedComponent.id, {
        content: {
          tag: selectedComponent.tag,
          content: selectedComponent.content,
          styles: selectedComponent.styles,
          attributes: selectedComponent.attributes,
          selector: selectedComponent.selector,
          position: selectedComponent.position
        }
      });
      
      toast.success("Changes saved!");
    } catch (error) {
      console.error("Failed to save changes:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const getViewportWidth = () => {
    switch (viewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
      default: return '100%';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading editor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => navigate("/dashboard")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>Back</span>
          </button>
          
          <div className="flex items-center space-x-2">
            <Wand2 className="h-6 w-6 text-blue-600" />
            <h1 className="text-lg font-semibold text-gray-900">
              {project?.title || "Untitled Project"}
            </h1>
          </div>
          
          {project?.framework && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {project.framework.framework}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          {/* Viewport Controls */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('mobile')}
              className={`p-2 rounded ${viewMode === 'mobile' ? 'bg-white shadow-sm' : ''}`}
            >
              <Smartphone className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('tablet')}
              className={`p-2 rounded ${viewMode === 'tablet' ? 'bg-white shadow-sm' : ''}`}
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('desktop')}
              className={`p-2 rounded ${viewMode === 'desktop' ? 'bg-white shadow-sm' : ''}`}
            >
              <Monitor className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={() => setShowCode(!showCode)}
            className={`p-2 rounded ${showCode ? 'bg-blue-100 text-blue-600' : 'bg-gray-100'}`}
          >
            <Code className="h-4 w-4" />
          </button>

          <button
            onClick={saveChanges}
            disabled={saving || !selectedComponent}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
          >
            <Save className="h-4 w-4" />
            <span>{saving ? "Saving..." : "Save"}</span>
          </button>
        </div>
      </header>

      {/* Main Editor */}
      <div className="flex-1 flex">
        {/* Sidebar */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
          {/* Sidebar Tabs */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setSidebarTab('layers')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                sidebarTab === 'layers' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
              }`}
            >
              <Layers className="h-4 w-4 mx-auto" />
            </button>
            <button
              onClick={() => setSidebarTab('properties')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                sidebarTab === 'properties' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
              }`}
            >
              <Settings className="h-4 w-4 mx-auto" />
            </button>
            <button
              onClick={() => setSidebarTab('styles')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                sidebarTab === 'styles' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
              }`}
            >
              <Palette className="h-4 w-4 mx-auto" />
            </button>
          </div>

          {/* Sidebar Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {sidebarTab === 'layers' && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Components</h3>
                {components.length === 0 ? (
                  <p className="text-sm text-gray-500">
                    Click on elements in the preview to select and edit them.
                  </p>
                ) : (
                  <div className="space-y-1">
                    {components.map((component) => (
                      <div
                        key={component.id}
                        onClick={() => setSelectedComponent(component)}
                        className={`p-2 rounded cursor-pointer text-sm ${
                          selectedComponent?.id === component.id
                            ? 'bg-blue-100 text-blue-900'
                            : 'hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <span className="capitalize">{component.type}</span>
                          <span className="text-xs text-gray-500">({component.tag})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {sidebarTab === 'properties' && selectedComponent && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Properties</h3>
                
                <div className="space-y-4">
                  {/* Content */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Content
                    </label>
                    <textarea
                      value={selectedComponent.content || ''}
                      onChange={(e) => updateComponentProperty('content', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      rows={3}
                    />
                  </div>

                  {/* Tag */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      HTML Tag
                    </label>
                    <select
                      value={selectedComponent.tag}
                      onChange={(e) => updateComponentProperty('tag', e.target.value)}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                    >
                      <option value="div">div</option>
                      <option value="p">p</option>
                      <option value="h1">h1</option>
                      <option value="h2">h2</option>
                      <option value="h3">h3</option>
                      <option value="span">span</option>
                      <option value="a">a</option>
                      <option value="button">button</option>
                    </select>
                  </div>

                  {/* Attributes */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      CSS Classes
                    </label>
                    <input
                      type="text"
                      value={selectedComponent.attributes.class || ''}
                      onChange={(e) => updateComponentProperty('attributes', { 
                        ...selectedComponent.attributes, 
                        class: e.target.value 
                      })}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      placeholder="class-name another-class"
                    />
                  </div>
                </div>
              </div>
            )}

            {sidebarTab === 'styles' && selectedComponent && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Styles</h3>
                
                <div className="space-y-4">
                  {/* Typography */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Typography</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Font Size</label>
                        <input
                          type="text"
                          value={selectedComponent.styles.fontSize || ''}
                          onChange={(e) => updateComponentProperty('styles', { fontSize: e.target.value })}
                          className="w-full p-1 border border-gray-300 rounded text-sm"
                          placeholder="16px"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Color</label>
                        <input
                          type="color"
                          value={selectedComponent.styles.color || '#000000'}
                          onChange={(e) => updateComponentProperty('styles', { color: e.target.value })}
                          className="w-full h-8 border border-gray-300 rounded"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Layout */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Layout</h4>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Padding</label>
                        <input
                          type="text"
                          value={selectedComponent.styles.padding || ''}
                          onChange={(e) => updateComponentProperty('styles', { padding: e.target.value })}
                          className="w-full p-1 border border-gray-300 rounded text-sm"
                          placeholder="10px"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-600 mb-1">Margin</label>
                        <input
                          type="text"
                          value={selectedComponent.styles.margin || ''}
                          onChange={(e) => updateComponentProperty('styles', { margin: e.target.value })}
                          className="w-full p-1 border border-gray-300 rounded text-sm"
                          placeholder="10px"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Background */}
                  <div>
                    <h4 className="text-xs font-medium text-gray-700 mb-2">Background</h4>
                    <div>
                      <label className="block text-xs text-gray-600 mb-1">Background Color</label>
                      <input
                        type="color"
                        value={selectedComponent.styles.backgroundColor || '#ffffff'}
                        onChange={(e) => updateComponentProperty('styles', { backgroundColor: e.target.value })}
                        className="w-full h-8 border border-gray-300 rounded"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Preview Area */}
        <main className="flex-1 flex flex-col bg-gray-100">
          <div className="flex-1 flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300"
              style={{ width: getViewportWidth(), height: '100%', maxHeight: '90vh' }}
            >
              {project?.site_url ? (
                <iframe
                  ref={iframeRef}
                  src={project.site_url}
                  className="w-full h-full border-0"
                  onLoad={handleIframeLoad}
                  title="Website Preview"
                  sandbox="allow-scripts allow-same-origin"
                />
              ) : (
                <div className="flex items-center justify-center h-full text-gray-500">
                  <div className="text-center">
                    <Eye className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>No website URL available</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Status Bar */}
          <div className="bg-white border-t border-gray-200 px-4 py-2 text-sm text-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span>
                  {selectedComponent 
                    ? `Selected: ${selectedComponent.type} (${selectedComponent.tag})`
                    : "Click on any element to select and edit"
                  }
                </span>
                {iframeLoaded && (
                  <span className="text-green-600">• Website loaded</span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <span>{viewMode} view</span>
                <span>•</span>
                <span>{components.length} components</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Editor;
