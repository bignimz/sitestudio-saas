import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { subscription, isLoading } = useAuth();

  if (isLoading) return <div>Loading subscription...</div>;

  if (subscription?.status !== "active") {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
}
