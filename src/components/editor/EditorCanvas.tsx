import { useDrop } from "react-dnd";
import ComponentBlock from "./ComponentBlock";

export default function EditorCanvas({ components }) {
  const [, drop] = useDrop(() => ({
    accept: "COMPONENT",
    drop: (item) => console.log("Dropped:", item),
  }));

  return (
    <div ref={drop} className="flex-1 grid grid-cols-12 gap-4 p-4 bg-gray-50">
      {components.map((component) => (
        <ComponentBlock key={component.id} data={component} />
      ))}
    </div>
  );
}
