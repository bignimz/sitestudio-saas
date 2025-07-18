import { Plus } from "lucide-react";

export default function SidebarPanel({ onAddComponent }) {
  const componentTypes = [
    { type: "text", label: "Text Block" },
    { type: "image", label: "Image" },
    { type: "section", label: "Section" },
  ];

  return (
    <div className="w-64 p-4 bg-white border-r">
      <h3 className="font-bold mb-4">Components</h3>
      <ul className="space-y-2">
        {componentTypes.map((item) => (
          <li key={item.type}>
            <button
              onClick={() => onAddComponent(item.type)}
              className="flex items-center gap-2 p-2 hover:bg-gray-100 w-full text-left"
            >
              <Plus size={16} />
              {item.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
