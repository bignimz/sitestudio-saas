import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <DndProvider backend={HTML5Backend}>
      <App />
    </DndProvider>
  </QueryClientProvider>
);
