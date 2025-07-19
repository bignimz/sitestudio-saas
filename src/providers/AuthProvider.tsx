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
      
      try {
        const { data, error } = await supabase
          .from("subscriptions")
          .select("status, plan_type")
          .eq("user_id", state.user.id)
          .single();
        
        if (error) {
          console.log("Subscriptions table not found, using default free plan");
          // Return default free subscription if table doesn't exist
          return { status: 'active', plan_type: 'free' };
        }
        
        return data;
      } catch (error) {
        console.log("Error fetching subscription, using default free plan:", error);
        // Return default free subscription on any error
        return { status: 'active', plan_type: 'free' };
      }
    },
    enabled: !!state.user?.id,
  });

  const value = {
    ...state,
    subscription,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
