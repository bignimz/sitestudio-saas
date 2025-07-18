import { useDrag } from "react-dnd";

export default function ComponentBlock({ data }) {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: "COMPONENT",
    item: { id: data.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  return (
    <div
      ref={drag}
      className={`p-4 border rounded-lg bg-white shadow-sm cursor-move ${isDragging ? "opacity-50" : "opacity-100"}`}
    >
      {data.component_type === "text" ? (
        <div contentEditable className="outline-none">
          {data.content?.text || "Edit me..."}
        </div>
      ) : (
        <img src={data.content?.url} alt="Component" />
      )}
    </div>
  );
}
