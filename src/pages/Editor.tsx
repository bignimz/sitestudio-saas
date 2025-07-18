import { useState } from "react";
import EditorCanvas from "../components/editor/EditorCanvas";
import SidebarPanel from "../components/editor/SidebarPanel";

export default function Editor() {
  const [components, setComponents] = useState([]);

  const handleAddComponent = (type) => {
    setComponents((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        component_type: type,
        content: type === "text" ? { text: "New Text" } : { url: "" },
        position: prev.length + 1,
      },
    ]);
  };

  return (
    <div className="flex h-screen">
      <SidebarPanel onAddComponent={handleAddComponent} />
      <EditorCanvas components={components} />
    </div>
  );
}
