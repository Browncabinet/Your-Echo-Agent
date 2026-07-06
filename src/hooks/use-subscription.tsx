import { useState, useEffect, useCallback, createContext, useContext } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { getPaddleEnvironment } from "@/lib/paddle";

export type WeeklyCaps = {
  tier: "none" | "starter" | "growth" | "power";
  email_cap: number;
  linkedin_cap: number;
  emails_used: number;
  linkedin_used: number;
  week_start: string;
  subscription_active: boolean;
};

const PRICE_LABELS: Record<string, string> = {
  starter_weekly: "Starter Weekly",
  growth_weekly: "Growth Weekly",
  power_weekly: "Power Weekly",
};

type Ctx = {
  caps: WeeklyCaps | null;
  loading: boolean;
  tierLabel: string;
  isActive: boolean;
  refresh: () => Promise<void>;
  openPortal: () => Promise<void>;
};

const SubscriptionContext = createContext<Ctx>({
  caps: null,
  loading: true,
  tierLabel: "Free",
  isActive: false,
  refresh: async () => {},
  openPortal: async () => {},
});

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [caps, setCaps] = useState<WeeklyCaps | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.rpc("current_week_caps", { _user_id: user.id });
    if (!error && data) {
      const row = Array.isArray(data) ? data[0] : (data as any);
      setCaps(row as WeeklyCaps);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!user) return;
    const ch = supabase
      .channel("subscriptions-watch")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "subscriptions", filter: `user_id=eq.${user.id}` },
        () => refresh()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "weekly_usage", filter: `user_id=eq.${user.id}` },
        () => refresh()
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
  }, [user, refresh]);

  const openPortal = useCallback(async () => {
    const { data, error } = await supabase.functions.invoke("create-portal-session", {
      body: {
        environment: getStripeEnvironment(),
        returnUrl: window.location.origin,
      },
    });
    if (error || !data?.url) {
      console.error("portal error", error);
      return;
    }
    window.open(data.url, "_blank");
  }, []);

  const tierLabel = caps?.subscription_active && caps.tier !== "none"
    ? PRICE_LABELS[`${caps.tier}_weekly`] || "Active"
    : "Free";

  return (
    <SubscriptionContext.Provider
      value={{ caps, loading, tierLabel, isActive: !!caps?.subscription_active, refresh, openPortal }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  return useContext(SubscriptionContext);
}
