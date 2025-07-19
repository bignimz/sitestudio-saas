import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ArrowLeft, Save, Eye, Code, Smartphone, Tablet, Monitor, 
  Settings, Layers, Palette, Type, Image, Link, MousePointer,
  Undo, Redo, Download, Share, Wand2, ExternalLink, Globe
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
  name: string;
  description: string;
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
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  const [project, setProject] = useState<Project | null>(null);
  const [components, setComponents] = useState<EditorComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<EditorComponent | null>(null);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [editorMode, setEditorMode] = useState<'visual' | 'code'>('visual');
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pageTitle, setPageTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadComponents();
    }
  }, [projectId]);

  useEffect(() => {
    // Auto-select component from URL parameter
    const componentId = searchParams.get('component');
    if (componentId && components.length > 0) {
      const component = components.find(c => c.id === componentId);
      if (component) {
        setSelectedComponent(component);
      }
    }
  }, [searchParams, components]);

  const loadProject = async () => {
    try {
      const data = await projectsApi.getProject(projectId!);
      if (data.data) {
        setProject(data.data);
        setPageTitle(data.data.title);
        setMetaDescription(data.data.description || "");
      }
    } catch (error) {
      console.error("Failed to load project:", error);
      toast.error("Failed to load project");
    }
  };

  const loadComponents = async () => {
    try {
      setLoading(true);
      
      // Mock components with more realistic data
      const mockComponents: EditorComponent[] = [
        {
          id: "1",
          type: "header",
          name: "Header Navigation",
          description: "Home About Services Contact...",
          tag: "header",
          content: "Home About Services Contact",
          styles: { backgroundColor: "#ffffff", padding: "16px" },
          attributes: { class: "navbar" },
          selector: "header",
          position: { x: 0, y: 0, width: 100, height: 60 }
        },
        {
          id: "2",
          type: "hero",
          name: "Hero Section", 
          description: "Welcome to Our Website - This is a sampl...",
          tag: "section",
          content: "Welcome to Our Website - This is a sample hero section",
          styles: { backgroundColor: "#f8fafc", padding: "64px 16px" },
          attributes: { class: "hero-section" },
          selector: "section.hero",
          position: { x: 0, y: 60, width: 100, height: 400 }
        },
        {
          id: "3",
          type: "section",
          name: "Content Section",
          description: "About Our Services - We provide excellen...",
          tag: "section",
          content: "About Our Services - We provide excellent services",
          styles: { backgroundColor: "#ffffff", padding: "48px 16px" },
          attributes: { class: "content-section" },
          selector: "section.content",
          position: { x: 0, y: 460, width: 100, height: 300 }
        },
        {
          id: "4",
          type: "footer",
          name: "Footer",
          description: "© 2024 Website. All rights reserved...",
          tag: "footer",
          content: "© 2024 Website. All rights reserved",
          styles: { backgroundColor: "#1f2937", color: "#ffffff", padding: "32px 16px" },
          attributes: { class: "footer" },
          selector: "footer",
          position: { x: 0, y: 760, width: 100, height: 120 }
        }
      ];
      
      setComponents(mockComponents);
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
          injectComponentSelectors(iframeDoc);
        }
      } catch (error) {
        console.error("Cannot access iframe content due to CORS:", error);
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
          
          doc.querySelectorAll('.ai-editor-selected').forEach(el => {
            el.classList.remove('ai-editor-selected');
          });
          
          element.classList.add('ai-editor-selected');
          
          const rect = element.getBoundingClientRect();
          const styles = window.getComputedStyle(element);
          
          const componentData: EditorComponent = {
            id: `element-${index}`,
            type: getComponentType(element.tagName.toLowerCase()),
            name: getComponentName(element.tagName.toLowerCase()),
            description: element.textContent?.trim().substring(0, 50) + "..." || '',
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

  const getComponentName = (tagName: string): string => {
    const nameMap: Record<string, string> = {
      'header': 'Header Navigation',
      'nav': 'Navigation',
      'footer': 'Footer',
      'section': 'Content Section',
      'article': 'Article',
      'h1': 'Main Heading', 'h2': 'Subheading', 'h3': 'Small Heading',
      'p': 'Paragraph',
      'img': 'Image',
      'a': 'Link',
      'button': 'Button',
      'div': 'Container',
      'span': 'Text'
    };
    return nameMap[tagName] || tagName.toUpperCase();
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
    applyChangesToIframe(updatedComponent);
  };

  const applyChangesToIframe = (component: EditorComponent) => {
    if (!iframeRef.current) return;
    
    try {
      const iframeDoc = iframeRef.current.contentDocument;
      if (iframeDoc) {
        const element = iframeDoc.querySelector('.ai-editor-selected');
        if (element) {
          Object.entries(component.styles).forEach(([property, value]) => {
            (element as HTMLElement).style.setProperty(property, value);
          });
          
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
    if (!projectId) return;
    
    try {
      setSaving(true);
      
      // Save project metadata
      await projectsApi.updateProject(projectId, {
        title: pageTitle,
        description: metaDescription
      });
      
      // Save component changes if any selected
      if (selectedComponent) {
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
      }
      
      toast.success("Changes saved!");
    } catch (error) {
      console.error("Failed to save changes:", error);
      toast.error("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    toast.success("Published successfully! (Demo)");
  };

  const handleExportCode = () => {
    toast.success("Code exported! (Demo)");
  };

  const handlePreviewLive = () => {
    if (project?.site_url) {
      window.open(project.site_url, '_blank');
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
          </button>
          
          <div className="flex items-center space-x-3">
            <Globe className="h-5 w-5 text-gray-600" />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {project?.title || "Your Website"}
              </h1>
              <p className="text-sm text-blue-600">{project?.site_url}</p>
            </div>
          </div>
          
          {project?.framework && (
            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
              {project.framework.framework}
            </span>
          )}
        </div>

        <div className="flex items-center space-x-3">
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

          {/* Visual/Code Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setEditorMode('visual')}
              className={`px-4 py-2 rounded text-sm font-medium ${
                editorMode === 'visual' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
              }`}
            >
              <Eye className="h-4 w-4 inline mr-1" />
              Visual
            </button>
            <button
              onClick={() => setEditorMode('code')}
              className={`px-4 py-2 rounded text-sm font-medium ${
                editorMode === 'code' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-600'
              }`}
            >
              <Code className="h-4 w-4 inline mr-1" />
              Code
            </button>
          </div>

          <button
            onClick={handlePublish}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <span>Publish</span>
          </button>
        </div>
      </header>

      {/* Main Editor */}
      <div className="flex-1 flex">
        {/* Left Sidebar - Components */}
        <aside className="w-80 bg-white border-r border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">
              Components ({components.length})
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {components.map((component) => (
                <div
                  key={component.id}
                  onClick={() => setSelectedComponent(component)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedComponent?.id === component.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900 text-sm">
                      {component.name}
                    </h4>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                      {component.tag}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {component.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </aside>

        {/* Center - Preview */}
        <main className="flex-1 flex flex-col bg-gray-100">
          <div className="flex-1 flex items-center justify-center p-4">
            <div 
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300"
              style={{ width: getViewportWidth(), height: '100%', maxHeight: '90vh' }}
            >
              {editorMode === 'visual' ? (
                project?.site_url ? (
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
                )
              ) : (
                <div className="p-4 font-mono text-sm">
                  <div className="text-gray-600 mb-4">HTML/CSS Code View</div>
                  <pre className="text-gray-800 whitespace-pre-wrap">
                    {`<!DOCTYPE html>
<html>
<head>
  <title>${pageTitle}</title>
  <meta name="description" content="${metaDescription}">
</head>
<body>
  <!-- Components will be rendered here -->
  ${components.map(comp => `<${comp.tag} class="${comp.attributes.class || ''}">${comp.content}</${comp.tag}>`).join('\n  ')}
</body>
</html>`}
                  </pre>
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
                    ? `Selected: ${selectedComponent.name} (${selectedComponent.tag})`
                    : "Click on any element to select and edit"
                  }
                </span>
                {iframeLoaded && editorMode === 'visual' && (
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

        {/* Right Sidebar - Settings */}
        <aside className="w-80 bg-white border-l border-gray-200 flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900">Settings</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            {/* Page Settings */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Page Settings</h4>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Page Title
                  </label>
                  <input
                    type="text"
                    value={pageTitle}
                    onChange={(e) => setPageTitle(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    placeholder="Your Website"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Meta Description
                  </label>
                  <textarea
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded text-sm"
                    rows={3}
                    placeholder="SEO description..."
                  />
                </div>
              </div>
            </div>

            {/* Component Properties */}
            {selectedComponent && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-3">Component Properties</h4>
                
                <div className="space-y-4">
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

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Background Color
                    </label>
                    <input
                      type="color"
                      value={selectedComponent.styles.backgroundColor || '#ffffff'}
                      onChange={(e) => updateComponentProperty('styles', { backgroundColor: e.target.value })}
                      className="w-full h-8 border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Text Color
                    </label>
                    <input
                      type="color"
                      value={selectedComponent.styles.color || '#000000'}
                      onChange={(e) => updateComponentProperty('styles', { color: e.target.value })}
                      className="w-full h-8 border border-gray-300 rounded"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Padding
                    </label>
                    <input
                      type="text"
                      value={selectedComponent.styles.padding || ''}
                      onChange={(e) => updateComponentProperty('styles', { padding: e.target.value })}
                      className="w-full p-2 border border-gray-300 rounded text-sm"
                      placeholder="16px"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Publishing */}
            <div>
              <h4 className="text-sm font-semibold text-gray-900 mb-3">Publishing</h4>
              
              <div className="space-y-3">
                <button
                  onClick={handleExportCode}
                  className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Export Code</span>
                </button>

                <button
                  onClick={handlePreviewLive}
                  className="w-full flex items-center justify-center space-x-2 border border-gray-300 text-gray-700 py-2 px-3 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  <span>Preview Live</span>
                </button>

                <button
                  onClick={saveChanges}
                  disabled={saving}
                  className="w-full bg-blue-600 text-white py-2 px-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center justify-center space-x-2"
                >
                  <Save className="h-4 w-4" />
                  <span>{saving ? "Saving..." : "Save Changes"}</span>
                </button>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Editor;
