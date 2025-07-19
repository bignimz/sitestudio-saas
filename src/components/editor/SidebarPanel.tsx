import React from "react";
import { motion } from "framer-motion";
import { Plus, Type, Image, Layout, MousePointer, Navigation, Globe } from "lucide-react";

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

interface SidebarPanelProps {
  onAddComponent: (type: string) => void;
  components: Component[];
  onReorderComponents: (components: Component[]) => void;
}

export default function SidebarPanel({ onAddComponent, components, onReorderComponents }: SidebarPanelProps) {
  const componentTypes = [
    { type: "hero", label: "Hero Section", icon: Layout, color: "bg-purple-100 text-purple-700" },
    { type: "navbar", label: "Navigation", icon: Navigation, color: "bg-blue-100 text-blue-700" },
    { type: "text", label: "Text Block", icon: Type, color: "bg-gray-100 text-gray-700" },
    { type: "image", label: "Image", icon: Image, color: "bg-green-100 text-green-700" },
    { type: "section", label: "Section", icon: Layout, color: "bg-orange-100 text-orange-700" },
    { type: "cta", label: "Call to Action", icon: MousePointer, color: "bg-red-100 text-red-700" },
    { type: "footer", label: "Footer", icon: Globe, color: "bg-indigo-100 text-indigo-700" },
  ];

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
      {/* Add Components Section */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-lg mb-4">Add Components</h3>
        <div className="space-y-2">
          {componentTypes.map((item) => {
            const IconComponent = item.icon;
            return (
              <motion.button
                key={item.type}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onAddComponent(item.type)}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 w-full text-left rounded-lg border border-gray-200 transition-colors"
              >
                <div className={`p-2 rounded-lg ${item.color}`}>
                  <IconComponent size={18} />
                </div>
                <span className="font-medium">{item.label}</span>
                <Plus size={16} className="ml-auto text-gray-400" />
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Components List Section */}
      <div className="flex-1 p-4 overflow-y-auto">
        <h3 className="font-semibold text-lg mb-4">Page Structure</h3>
        {components.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Layout className="mx-auto h-12 w-12 text-gray-300 mb-3" />
            <p className="text-sm">No components yet</p>
            <p className="text-xs">Add components to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {components
              .sort((a, b) => a.position - b.position)
              .map((component, index) => {
                const componentType = componentTypes.find((t) => t.type === component.component_type);
                const IconComponent = componentType?.icon || Layout;

                return (
                  <motion.div
                    key={component.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className={`p-1.5 rounded ${componentType?.color || "bg-gray-100 text-gray-700"}`}>
                      <IconComponent size={14} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {componentType?.label || component.component_type}
                      </div>
                      <div className="text-xs text-gray-500">Position {component.position + 1}</div>
                    </div>

                    <div className="flex items-center gap-1">
                      <span
                        className={`w-2 h-2 rounded-full ${component.is_visible ? "bg-green-400" : "bg-gray-400"}`}
                      />
                    </div>
                  </motion.div>
                );
              })}
          </div>
        )}
      </div>

      {/* Tips Section */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        <h4 className="font-medium text-sm mb-2">💡 Tips</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• Start with a Hero section for impact</li>
          <li>• Add Navigation for easy browsing</li>
          <li>• Use Call to Action buttons strategically</li>
          <li>• Click AI Suggestions for improvements</li>
        </ul>
      </div>
    </div>
  );
}
