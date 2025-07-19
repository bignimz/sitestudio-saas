import { Navigate } from "react-router-dom";
import { useAuth } from "../providers/use-auth";

export function SubscriptionGuard({ children }: { children: React.ReactNode }) {
  const { subscription, isLoading } = useAuth();

  if (isLoading) return <div>Loading subscription...</div>;

  if (subscription?.status !== "active") {
    return <Navigate to="/pricing" replace />;
  }

  return <>{children}</>;
}
