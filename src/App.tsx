import { RouterProvider, createBrowserRouter } from "react-router-dom";
import Home from "./pages/Home";
import { Login } from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Editor from "./pages/Editor";
import { AuthGuard } from "./components/AuthGuard";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/login", element: <Login /> },
  {
    path: "/dashboard",
    element: (
      <AuthGuard>
        <Dashboard />
      </AuthGuard>
    ),
  },
  {
    path: "/editor/:projectId",
    element: (
      <AuthGuard>
        <Editor />
      </AuthGuard>
    ),
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
