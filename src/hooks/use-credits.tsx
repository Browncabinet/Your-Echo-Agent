import { useState, useEffect, createContext, useContext, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface CreditsContextType {
  balance: number;
  loading: boolean;
  refresh: () => Promise<void>;
}

const CreditsContext = createContext<CreditsContextType>({ balance: 0, loading: true, refresh: async () => {} });

export function CreditsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase
      .from("user_credits")
      .select("balance")
      .eq("user_id", user.id)
      .maybeSingle();

    if (data) {
      setBalance(data.balance);
    } else {
      // Credits are auto-created by DB trigger on signup; default to 50 for display
      setBalance(50);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <CreditsContext.Provider value={{ balance, loading, refresh }}>
      {children}
    </CreditsContext.Provider>
  );
}

export function useCredits() {
  return useContext(CreditsContext);
}
