import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { type Campaign, createEmptyCampaign } from "@/lib/campaign-data";
import type { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";

function campaignToRow(campaign: Campaign, userId: string) {
  return {
    id: campaign.id,
    user_id: userId,
    name: campaign.name,
    goal: campaign.goal,
    website_url: campaign.websiteUrl,
    niche: campaign.niche,
    target_audience: campaign.targetAudience as unknown as Json,
    leads: campaign.leads as unknown as Json,
    emails: campaign.emails as unknown as Json,
    status: campaign.status,
    updated_at: new Date().toISOString(),
  };
}

function rowToCampaign(row: any): Campaign {
  return {
    id: row.id,
    name: row.name || "",
    goal: row.goal || "",
    websiteUrl: row.website_url || "",
    niche: row.niche || "",
    targetAudience: (row.target_audience as string[]) || [],
    leads: (row.leads as any[]) || [],
    emails: (row.emails as any[]) || [],
    batchSize: 50,
    status: row.status || "setup",
    stats: { sent: 0, opened: 0, clicked: 0, replied: 0 },
    createdAt: row.created_at,
  };
}

export function useCampaigns() {
  const { user } = useAuth();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  // Load campaigns on mount
  useEffect(() => {
    if (!user) {
      setCampaigns([]);
      setLoading(false);
      return;
    }

    const load = async () => {
      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Failed to load campaigns:", error);
        toast.error("Failed to load campaigns");
      } else {
        setCampaigns((data || []).map(rowToCampaign));
      }
      setLoading(false);
    };

    load();
  }, [user]);

  const saveCampaign = useCallback(
    async (campaign: Campaign) => {
      if (!user) return;

      const row = campaignToRow(campaign, user.id);
      const { error } = await supabase
        .from("campaigns")
        .upsert(row, { onConflict: "id" });

      if (error) {
        console.error("Failed to save campaign:", error);
        toast.error("Failed to save campaign");
        return;
      }

      setCampaigns((prev) => {
        const existing = prev.findIndex((c) => c.id === campaign.id);
        if (existing >= 0) {
          const updated = [...prev];
          updated[existing] = campaign;
          return updated;
        }
        return [campaign, ...prev];
      });
    },
    [user]
  );

  return { campaigns, setCampaigns, loading, saveCampaign };
}
