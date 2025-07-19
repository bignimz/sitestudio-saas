import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";

// Simple test component
function App() {
  return (
    <div style={{ padding: "20px" }}>
      <h1>🚀 AI Site Editor</h1>
      <p>If you can see this, React is working!</p>
      <button onClick={() => alert("Button works!")}>
        Test Button
      </button>
    </div>
  );
}

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error("Root container not found");
}