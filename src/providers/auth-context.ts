import { createContext } from "react";
import type { Session, User } from "@supabase/supabase-js";

type Subscription = {
  status: "active" | "canceled" | "trialing" | "past_due" | "unpaid";
  plan_type: "daily" | "monthly";
} | null;

export type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  subscription: Subscription;
};

export const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  subscription: null,
});
