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
      if (!iframeDoc) return;

      // Add editor styles
      const style = iframeDoc.createElement('style');
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
          pointer-events: none;
        }
        .ai-editor-selected {
          outline: 2px solid #10b981 !important;
          outline-offset: 2px !important;
        }
      `;
      iframeDoc.head.appendChild(style);

      // Add click handlers to all elements
      const allElements = iframeDoc.querySelectorAll('*');
      allElements.forEach((element, index) => {
        if (['script', 'style', 'meta', 'link', 'title'].includes(element.tagName.toLowerCase())) {
          return;
        }

        // Add hover effects
        element.addEventListener('mouseenter', () => {
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
          const rect = element.getBoundingClientRect();
          const styles = window.getComputedStyle(element);
          
          const componentData = {
            id: `element-${index}`,
            project_id: '', // Will be set by parent
            component_type: getComponentType(element.tagName.toLowerCase()),
            content: {
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

    } catch (error) {
      console.error('Cannot access iframe content due to CORS:', error);
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
            <iframe
              ref={iframeRef}
              src={siteUrl}
              className="w-full h-full border-0"
              onLoad={handleIframeLoad}
              title="Website Preview"
              sandbox="allow-scripts allow-same-origin allow-forms"
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              <div className="text-center">
                <Monitor className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                <p>No website URL available</p>
                <p className="text-sm">Add a website URL to start editing</p>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Status Bar */}
      <div className="bg-white border-t border-gray-200 px-4 py-2 text-sm text-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span>
              {selectedComponent 
                ? `Selected: ${selectedComponent.content?.tag || 'Element'} (${selectedComponent.component_type})`
                : "Hover over elements to highlight, click to select and edit"
              }
            </span>
            {iframeLoaded && (
              <span className="text-green-600">• Website loaded</span>
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