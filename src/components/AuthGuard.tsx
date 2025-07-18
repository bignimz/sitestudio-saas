import { useAuth } from "../providers/use-auth";
import { Navigate } from "react-router-dom";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>; // Show a spinner
  }

  if (!user) {
    return <Navigate to="/login" replace />; // Redirect if not logged in
  }

  return <>{children}</>;
}
