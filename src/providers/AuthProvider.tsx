import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./auth-context";
import type { User, Session } from "@supabase/supabase-js";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{
    user: User | null;
    session: Session | null;
    isLoading: boolean;
  }>({
    user: null,
    session: null,
    isLoading: true,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setState({
        user: session?.user ?? null,
        session,
        isLoading: false,
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event, session) => {
        setState({
          user: session?.user ?? null,
          session,
          isLoading: false,
        });
      });

      return () => subscription.unsubscribe();
    };

    initializeAuth();
  }, []);

  const { data: subscription } = useQuery({
    queryKey: ["subscription", state.user?.id],
    queryFn: async () => {
      if (!state.user?.id) return null;
      const { data, error } = await supabase
        .from("subscriptions")
        .select("status, plan_type")
        .eq("user_id", state.user.id)
        .single();
      return error ? null : data;
    },
    enabled: !!state.user?.id,
  });

  const value = {
    ...state,
    subscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
