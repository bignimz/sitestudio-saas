import React, { useState } from "react";
import { useDrag } from "react-dnd";
import { motion } from "framer-motion";
import { Edit, Trash2, Eye, EyeOff } from "lucide-react";
import { Component } from "../../types";

interface ComponentBlockProps {
  data: Component;
  onUpdate: (componentId: string, updates: Partial<Component>) => void;
  onDelete: (componentId: string) => void;
}

export default function ComponentBlock({ data, onUpdate, onDelete }: ComponentBlockProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const [{ isDragging }, drag] = useDrag(() => ({
    type: "COMPONENT",
    item: { id: data.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  const handleContentUpdate = (newContent: any) => {
    onUpdate(data.id, { content: newContent });
  };

  const handleStyleUpdate = (newStyles: any) => {
    onUpdate(data.id, { styles: { ...data.styles, ...newStyles } });
  };

  const toggleVisibility = () => {
    onUpdate(data.id, { is_visible: !data.is_visible });
  };

  const renderComponent = () => {
    const { component_type, content, styles } = data;

    switch (component_type) {
      case 'hero':
        return (
          <div 
            className="text-center py-16 px-8 rounded-lg"
            style={{ 
              backgroundColor: content.backgroundColor || '#f8fafc',
              ...styles 
            }}
          >
            <h1 
              className="text-4xl font-bold mb-4"
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleContentUpdate({ ...content, title: e.target.textContent })}
            >
              {content.title || 'Hero Title'}
            </h1>
            <p 
              className="text-xl text-gray-600 mb-8"
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleContentUpdate({ ...content, subtitle: e.target.textContent })}
            >
              {content.subtitle || 'Hero subtitle goes here'}
            </p>
            <button 
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleContentUpdate({ ...content, ctaText: e.target.textContent })}
            >
              {content.ctaText || 'Get Started'}
            </button>
          </div>
        );

      case 'navbar':
        return (
          <nav 
            className="flex items-center justify-between p-4 rounded-lg"
            style={{ 
              backgroundColor: content.backgroundColor || '#ffffff',
              color: content.textColor || '#000000',
              ...styles 
            }}
          >
            <div 
              className="text-xl font-bold"
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleContentUpdate({ ...content, logoText: e.target.textContent })}
            >
              {content.logoText || 'Logo'}
            </div>
            <div className="flex items-center space-x-6">
              {(content.links || []).map((link: any, index: number) => (
                <a 
                  key={index}
                  href={link.url || '#'}
                  className="hover:text-blue-600 transition-colors"
                  contentEditable={isEditing}
                  suppressContentEditableWarning
                  onBlur={(e) => {
                    const newLinks = [...(content.links || [])];
                    newLinks[index] = { ...link, text: e.target.textContent };
                    handleContentUpdate({ ...content, links: newLinks });
                  }}
                >
                  {link.text || 'Link'}
                </a>
              ))}
            </div>
          </nav>
        );

      case 'text':
        return (
          <div 
            className="p-4 rounded-lg"
            style={{ 
              fontSize: content.fontSize || '16px',
              color: content.color || '#000000',
              textAlign: content.alignment || 'left',
              ...styles 
            }}
          >
            <div
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleContentUpdate({ ...content, text: e.target.textContent })}
              className="outline-none"
            >
              {content.text || 'Click to edit text...'}
            </div>
          </div>
        );

      case 'image':
        return (
          <div className="rounded-lg overflow-hidden" style={styles}>
            <img 
              src={content.url || 'https://via.placeholder.com/400x300'} 
              alt={content.alt || 'Image'}
              className="w-full h-auto object-cover"
              style={{ 
                width: content.width || 'auto',
                height: content.height || 'auto'
              }}
            />
            {isEditing && (
              <div className="p-4 bg-gray-50 border-t">
                <input
                  type="url"
                  value={content.url || ''}
                  onChange={(e) => handleContentUpdate({ ...content, url: e.target.value })}
                  placeholder="Image URL"
                  className="w-full p-2 border rounded mb-2"
                />
                <input
                  type="text"
                  value={content.alt || ''}
                  onChange={(e) => handleContentUpdate({ ...content, alt: e.target.value })}
                  placeholder="Alt text"
                  className="w-full p-2 border rounded"
                />
              </div>
            )}
          </div>
        );

      case 'section':
        return (
          <div 
            className="p-8 rounded-lg"
            style={{ 
              backgroundColor: content.backgroundColor || '#ffffff',
              ...styles 
            }}
          >
            {content.title && (
              <h2 
                className="text-2xl font-bold mb-4"
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleContentUpdate({ ...content, title: e.target.textContent })}
              >
                {content.title}
              </h2>
            )}
            <div
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleContentUpdate({ ...content, text: e.target.textContent })}
              className="outline-none"
            >
              {content.text || 'Section content goes here...'}
            </div>
          </div>
        );

      case 'cta':
        return (
          <div className="text-center p-8" style={styles}>
            <button
              className="px-8 py-4 rounded-lg font-medium text-lg transition-colors"
              style={{
                backgroundColor: content.backgroundColor || '#3b82f6',
                color: content.textColor || '#ffffff'
              }}
              contentEditable={isEditing}
              suppressContentEditableWarning
              onBlur={(e) => handleContentUpdate({ ...content, text: e.target.textContent })}
            >
              {content.text || 'Call to Action'}
            </button>
          </div>
        );

      case 'footer':
        return (
          <footer 
            className="p-8 rounded-lg"
            style={{ 
              backgroundColor: content.backgroundColor || '#f8fafc',
              color: content.textColor || '#64748b',
              ...styles 
            }}
          >
            <div className="text-center">
              <div
                contentEditable={isEditing}
                suppressContentEditableWarning
                onBlur={(e) => handleContentUpdate({ ...content, copyright: e.target.textContent })}
                className="outline-none"
              >
                {content.copyright || `© ${new Date().getFullYear()} Company Name`}
              </div>
              {content.links && content.links.length > 0 && (
                <div className="flex justify-center space-x-6 mt-4">
                  {content.links.map((link: any, index: number) => (
                    <a 
                      key={index}
                      href={link.url || '#'}
                      className="hover:text-blue-600 transition-colors"
                      contentEditable={isEditing}
                      suppressContentEditableWarning
                      onBlur={(e) => {
                        const newLinks = [...(content.links || [])];
                        newLinks[index] = { ...link, text: e.target.textContent };
                        handleContentUpdate({ ...content, links: newLinks });
                      }}
                    >
                      {link.text || 'Link'}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </footer>
        );

      default:
        return (
          <div className="p-4 bg-gray-100 rounded-lg text-center text-gray-500">
            Unknown component type: {component_type}
          </div>
        );
    }
  };

  return (
    <motion.div
      ref={drag}
      className={`relative group border-2 rounded-lg transition-all ${
        isDragging ? "opacity-50" : "opacity-100"
      } ${
        isEditing ? "border-blue-500 shadow-lg" : "border-transparent hover:border-gray-300"
      } ${
        !data.is_visible ? "opacity-50" : ""
      }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: isEditing ? 1 : 1.01 }}
    >
      {/* Component Controls */}
      {(isHovered || isEditing) && (
        <div className="absolute top-2 right-2 flex items-center gap-2 bg-white rounded-lg shadow-lg border p-1 z-10">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`p-1.5 rounded transition-colors ${
              isEditing ? 'bg-blue-100 text-blue-600' : 'hover:bg-gray-100'
            }`}
            title={isEditing ? "Stop editing" : "Edit component"}
          >
            <Edit size={14} />
          </button>
          
          <button
            onClick={toggleVisibility}
            className={`p-1.5 rounded transition-colors ${
              data.is_visible ? 'hover:bg-gray-100' : 'bg-gray-100 text-gray-500'
            }`}
            title={data.is_visible ? "Hide component" : "Show component"}
          >
            {data.is_visible ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          
          <button
            onClick={() => onDelete(data.id)}
            className="p-1.5 rounded hover:bg-red-100 text-red-600 transition-colors"
            title="Delete component"
          >
            <Trash2 size={14} />
          </button>
        </div>
      )}

      {/* Component Type Badge */}
      {(isHovered || isEditing) && (
        <div className="absolute top-2 left-2 bg-gray-900 text-white text-xs px-2 py-1 rounded-md z-10">
          {data.component_type}
        </div>
      )}

      {/* Component Content */}
      <div className={isEditing ? "ring-2 ring-blue-500 ring-opacity-50 rounded-lg" : ""}>
        {renderComponent()}
      </div>
    </motion.div>
  );
}
