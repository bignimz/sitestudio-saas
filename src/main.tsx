import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/query-client";
import { AuthProvider } from "./providers/AuthProvider";
import { Toaster } from "sonner";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DndProvider backend={HTML5Backend}>
        <App />
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: 'white',
              border: '1px solid #e5e7eb',
              color: '#374151',
            }
          }}
        />
      </DndProvider>
    </AuthProvider>
  </QueryClientProvider>
);
