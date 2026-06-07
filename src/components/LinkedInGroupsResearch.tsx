import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Users, Sparkles, Loader2, ExternalLink, RefreshCw, Building2, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Result = {
  name: string;
  type: "group" | "association";
  url: string;
  members_estimate?: string | null;
  focus?: string;
  why_fit?: string;
  activity_signal?: "high" | "medium" | "low";
  engagement_tip?: string;
};

export function LinkedInGroupsResearch({ defaultNiche = "", defaultAudience = "", campaignId }: { defaultNiche?: string; defaultAudience?: string; campaignId?: string }) {
  const [niche, setNiche] = useState(defaultNiche);
  const [audience, setAudience] = useState(defaultAudience);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [cached, setCached] = useState(false);
  const primaryKey = `lk_primary_${campaignId || "default"}`;
  const [primaryName, setPrimaryName] = useState<string>(() => (typeof window !== "undefined" ? localStorage.getItem(primaryKey + "_name") || "" : ""));

  const markPrimary = (r: Result) => {
    localStorage.setItem(primaryKey + "_name", r.name);
    localStorage.setItem(primaryKey + "_url", r.url || "");
    setPrimaryName(r.name);
    toast.success(`"${r.name}" set as primary group`);
    window.dispatchEvent(new CustomEvent("lk-primary-changed", { detail: { campaignId, name: r.name, url: r.url } }));
  };

  const run = async (force = false) => {
    if (!niche.trim()) return toast.error("Add a niche first (e.g. Real Estate, Aerospace)");
    setLoading(true);
    const { data, error } = await supabase.functions.invoke("linkedin-groups-research", {
      body: { niche, audience, force },
    });
    setLoading(false);
    if (error || data?.error) return toast.error(data?.error || error?.message || "Failed");
    setResults(data.results || []);
    setCached(!!data.cached);
    if ((data.results || []).length === 0) toast("No groups found — try a broader niche", { icon: "🔍" });
  };

  const signalColor = (s?: string) =>
    s === "high" ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/30" :
    s === "medium" ? "bg-amber-500/15 text-amber-600 border-amber-500/30" :
    "bg-muted text-muted-foreground";

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">Group & Association Finder</h3>
          <Badge variant="outline" className="text-[10px]">LinkedIn-first</Badge>
        </div>
        {results.length > 0 && (
          <Button size="sm" variant="ghost" onClick={() => run(true)} disabled={loading}>
            <RefreshCw className="w-3 h-3 mr-1" /> Refresh
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        We research the most active LinkedIn Groups and professional associations for your niche. Use them to comment, connect, and warm prospects before outreach.
      </p>

      <div className="grid sm:grid-cols-2 gap-3 mb-3">
        <Input placeholder="Niche (e.g. Commercial Real Estate)" value={niche} onChange={(e) => setNiche(e.target.value)} />
        <Input placeholder="Audience (optional, e.g. CRE brokers in TX)" value={audience} onChange={(e) => setAudience(e.target.value)} />
      </div>
      <Button onClick={() => run(false)} disabled={loading} className="w-full sm:w-auto">
        {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
        {loading ? "Researching the best groups…" : "Find Groups & Associations"}
      </Button>

      {results.length > 0 && (
        <div className="mt-5 space-y-3">
          {cached && <p className="text-xs text-muted-foreground">Showing cached results (refreshes weekly)</p>}
          {results.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="border border-border rounded-lg p-4 hover:bg-muted/30 transition"
            >
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {r.type === "association" ? <Building2 className="w-4 h-4 text-primary" /> : <Users className="w-4 h-4 text-primary" />}
                  <span className="font-semibold text-foreground">{r.name}</span>
                  <Badge variant="outline" className="text-[10px] capitalize">{r.type}</Badge>
                  {r.activity_signal && (
                    <Badge variant="outline" className={`text-[10px] capitalize ${signalColor(r.activity_signal)}`}>
                      {r.activity_signal} activity
                    </Badge>
                  )}
                  {r.members_estimate && <Badge variant="secondary" className="text-[10px]">{r.members_estimate}</Badge>}
                </div>
                {r.url && (
                  <Button size="sm" variant="outline" asChild>
                    <a href={r.url} target="_blank" rel="noopener noreferrer">
                      Open <ExternalLink className="w-3 h-3 ml-1" />
                    </a>
                  </Button>
                )}
              </div>
              {r.focus && <p className="text-sm text-muted-foreground">{r.focus}</p>}
              {r.why_fit && <p className="text-sm mt-1"><span className="font-medium">Why it fits: </span>{r.why_fit}</p>}
              {r.engagement_tip && (
                <p className="text-xs mt-2 p-2 rounded bg-primary/5 border border-primary/15">
                  <span className="font-semibold">First move: </span>{r.engagement_tip}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </Card>
  );
}
