import React, { useRef, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Monitor, Tablet, Smartphone, ExternalLink } from 'lucide-react';

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

interface WebsitePreviewProps {
  siteUrl: string;
  components: Component[];
  selectedComponent: Component | null;
  onComponentSelect: (component: Component) => void;
  viewMode: 'desktop' | 'tablet' | 'mobile';
  onViewModeChange: (mode: 'desktop' | 'tablet' | 'mobile') => void;
}

export default function WebsitePreview({
  siteUrl,
  components,
  selectedComponent,
  onComponentSelect,
  viewMode,
  onViewModeChange
}: WebsitePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [selectedElementInfo, setSelectedElementInfo] = useState<any>(null);

  useEffect(() => {
    if (iframeLoaded && iframeRef.current) {
      injectEditorScripts();
    }
  }, [iframeLoaded, components]);

  const handleIframeLoad = () => {
    setIframeLoaded(true);
  };

  const injectEditorScripts = () => {
    if (!iframeRef.current) return;

    try {
      const iframeDoc = iframeRef.current.contentDocument;
      if (!iframeDoc) {
        console.log('Cannot access iframe document - likely CORS restricted');
        setSelectedElementInfo({ 
          corsError: true, 
          message: 'Interactive editing is blocked by CORS policy. Use the sidebar components for editing.' 
        });
        return;
      }

      // Check if we have same-origin access
      const iframeWindow = iframeRef.current.contentWindow;
      if (!iframeWindow) {
        console.log('Cannot access iframe window - CORS restricted');
        setSelectedElementInfo({ 
          corsError: true, 
          message: 'Interactive editing is blocked by CORS policy. Use the sidebar components for editing.' 
        });
        return;
      }

      // Add editor styles
      const style = iframeDoc.createElement('style');
      style.textContent = `
        .ai-editor-highlight {
          outline: 2px solid #3b82f6 !important;
          outline-offset: 2px !important;
          cursor: pointer !important;
          position: relative !important;
          transition: all 0.2s ease;
        }
        .ai-editor-highlight::after {
          content: attr(data-component-type);
          position: absolute;
          top: -28px;
          left: 0;
          background: #3b82f6;
          color: white;
          padding: 4px 8px;
          font-size: 11px;
          border-radius: 4px;
          z-index: 10000;
          pointer-events: none;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-weight: 500;
          white-space: nowrap;
        }
        .ai-editor-selected {
          outline: 3px solid #10b981 !important;
          outline-offset: 2px !important;
          background-color: rgba(16, 185, 129, 0.1) !important;
        }
        .ai-editor-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          z-index: 9999;
        }
      `;
      iframeDoc.head.appendChild(style);

      // Add click handlers to meaningful elements only
      const meaningfulSelectors = [
        'header', 'nav', 'main', 'section', 'article', 'aside', 'footer',
        'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'span', 'a', 'button',
        'img', 'form', 'input', 'textarea', 'select', 'ul', 'ol', 'li'
      ];

      meaningfulSelectors.forEach(selector => {
        const elements = iframeDoc.querySelectorAll(selector);
        elements.forEach((element, index) => {
          // Skip elements that are too small or hidden
          const rect = element.getBoundingClientRect();
          if (rect.width < 20 || rect.height < 10) return;

          const computedStyle = iframeWindow.getComputedStyle(element);
          if (computedStyle.display === 'none' || computedStyle.visibility === 'hidden') return;

          // Add hover effects
          element.addEventListener('mouseenter', () => {
            // Remove existing highlights
            iframeDoc.querySelectorAll('.ai-editor-highlight').forEach(el => {
              el.classList.remove('ai-editor-highlight');
            });
            
            element.classList.add('ai-editor-highlight');
            element.setAttribute('data-component-type', getComponentType(element.tagName.toLowerCase()));
          });

          element.addEventListener('mouseleave', () => {
            element.classList.remove('ai-editor-highlight');
          });

          // Add click handler
          element.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            
            // Remove previous selection
            iframeDoc.querySelectorAll('.ai-editor-selected').forEach(el => {
              el.classList.remove('ai-editor-selected');
            });
            
            // Select current element
            element.classList.add('ai-editor-selected');
            
            // Create component data from element
            const elementRect = element.getBoundingClientRect();
            const styles = iframeWindow.getComputedStyle(element);
            
            const componentData = {
              id: `live-${selector}-${index}`,
              project_id: '',
              component_type: getComponentType(element.tagName.toLowerCase()),
              content: {
                tag: element.tagName.toLowerCase(),
                content: element.textContent?.trim().substring(0, 200) || '',
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
                  textAlign: styles.textAlign,
                  fontWeight: styles.fontWeight,
                  lineHeight: styles.lineHeight
                },
                attributes: Array.from(element.attributes).reduce((acc, attr) => {
                  acc[attr.name] = attr.value;
                  return acc;
                }, {} as Record<string, any>),
                selector: generateSelector(element),
                position: {
                  x: elementRect.left,
                  y: elementRect.top,
                  width: elementRect.width,
                  height: elementRect.height
                }
              },
              position: index,
              styles: {},
              is_visible: true,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            };
            
            setSelectedElementInfo(componentData);
            onComponentSelect(componentData);
          });
        });
      });

      console.log('Editor scripts injected successfully');

    } catch (error) {
      console.error('Cannot access iframe content due to CORS restrictions:', error);
      // Show a message to the user about CORS limitations
      setSelectedElementInfo({ 
        corsError: true, 
        message: 'Direct editing is not available due to browser security restrictions. You can still edit the detected components from the sidebar.' 
      });
    }
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

  const getViewportWidth = () => {
    switch (viewMode) {
      case 'mobile': return '375px';
      case 'tablet': return '768px';
      case 'desktop': return '100%';
      default: return '100%';
    }
  };

  const getViewportHeight = () => {
    switch (viewMode) {
      case 'mobile': return '667px';
      case 'tablet': return '1024px';
      case 'desktop': return '100vh';
      default: return '100vh';
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-100">
      {/* Viewport Controls */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => onViewModeChange('mobile')}
              className={`p-2 rounded ${viewMode === 'mobile' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
              title="Mobile view"
            >
              <Smartphone className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('tablet')}
              className={`p-2 rounded ${viewMode === 'tablet' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
              title="Tablet view"
            >
              <Tablet className="h-4 w-4" />
            </button>
            <button
              onClick={() => onViewModeChange('desktop')}
              className={`p-2 rounded ${viewMode === 'desktop' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-600'}`}
              title="Desktop view"
            >
              <Monitor className="h-4 w-4" />
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)} View
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={siteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
            <span>Open Original</span>
          </a>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        <motion.div
          layout
          className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300"
          style={{ 
            width: getViewportWidth(), 
            height: viewMode === 'desktop' ? '90vh' : getViewportHeight(),
            maxWidth: '100%',
            maxHeight: '100%'
          }}
        >
          {siteUrl ? (
            <div className="w-full h-full relative">
              <iframe
                ref={iframeRef}
                src={siteUrl}
                className="w-full h-full border-0"
                onLoad={handleIframeLoad}
                onError={() => console.error('Failed to load website')}
                title="Website Preview"
                sandbox="allow-scripts allow-same-origin allow-forms"
              />
              {!iframeLoaded && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                    <p className="text-sm text-gray-600">Loading website...</p>
                  </div>
                </div>
              )}
              {selectedElementInfo?.corsError && iframeLoaded && (
                <div className="absolute top-4 left-4 right-4 bg-orange-50 border border-orange-200 rounded-lg p-4 shadow-lg">
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center">
                        <span className="text-orange-600 text-sm font-semibold">!</span>
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-orange-800 mb-1">
                        Interactive Editing Unavailable
                      </h4>
                      <p className="text-xs text-orange-700">
                        This website blocks direct editing due to security policies. 
                        You can still edit components using the sidebar panel.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center max-w-md p-6">
                <Monitor className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Website Preview</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Your website will appear here for visual editing. Due to CORS restrictions, 
                  some websites may not load in the preview.
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-left">
                  <h4 className="font-medium text-blue-900 mb-2">Demo Mode Active</h4>
                  <p className="text-xs text-blue-700">
                    We've created sample components from your website that you can edit using the sidebar and properties panel.
                  </p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {selectedElementInfo?.corsError ? (
              <div className="flex items-center space-x-2">
                <span className="text-orange-600">⚠️ CORS Restricted</span>
                <span className="text-xs text-gray-500">Use sidebar components for editing</span>
              </div>
            ) : selectedComponent ? (
              <span>
                Selected: {selectedComponent.content?.tag || 'Element'} ({selectedComponent.component_type})
              </span>
            ) : (
              <span>
                {iframeLoaded 
                  ? "Hover over elements to highlight, click to select and edit"
                  : "Loading website for interactive editing..."
                }
              </span>
            )}
            {iframeLoaded && !selectedElementInfo?.corsError && (
              <span className="text-green-600">• Interactive editing enabled</span>
            )}
            {iframeLoaded && selectedElementInfo?.corsError && (
              <span className="text-orange-600">• Limited by CORS policy</span>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <span>{viewMode} view</span>
            <span>•</span>
            <span>{components.length} components detected</span>
          </div>
        </div>
      </div>
    </div>
  );
}