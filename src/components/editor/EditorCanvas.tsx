import React from "react";
import { useDrop } from "react-dnd";
import ComponentBlock from "./ComponentBlock";

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

interface EditorCanvasProps {
  components: Component[];
  onUpdateComponent: (componentId: string, updates: Partial<Component>) => void;
  onDeleteComponent: (componentId: string) => void;
}

export default function EditorCanvas({ components, onUpdateComponent, onDeleteComponent }: EditorCanvasProps) {
  const [, drop] = useDrop(() => ({
    accept: "COMPONENT",
    drop: (item) => console.log("Dropped:", item),
  }));

  const sortedComponents = components.sort((a, b) => a.position - b.position);

  return (
    <div ref={drop} className="flex-1 bg-gray-50 overflow-y-auto">
      {/* Canvas Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Visual Editor</h2>
            <p className="text-sm text-gray-500">
              {components.length} component{components.length !== 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-sm text-gray-500">
              Responsive: <span className="text-blue-600 font-medium">Desktop</span>
            </div>
          </div>
        </div>
      </div>

      {/* Canvas Content */}
      <div className="p-6">
        {components.length === 0 ? (
          <div className="flex items-center justify-center h-96 border-2 border-dashed border-gray-300 rounded-lg">
            <div className="text-center">
              <div className="text-gray-400 mb-4">
                <svg className="mx-auto h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Start building your page</h3>
              <p className="text-gray-500 mb-4">Add components from the sidebar to get started</p>
              <div className="text-sm text-gray-400">
                Drag and drop components here or click "Add Components" in the sidebar
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto space-y-4">
            {sortedComponents.map((component) => (
              <ComponentBlock
                key={component.id}
                data={component}
                onUpdate={onUpdateComponent}
                onDelete={onDeleteComponent}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
