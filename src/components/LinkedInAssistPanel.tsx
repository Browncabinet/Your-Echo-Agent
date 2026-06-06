import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Linkedin, Sparkles, Loader2, Copy, ExternalLink, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

type Suggestions = {
  groups: { name: string; search_url: string }[];
  comment_drafts: string[];
  dm_drafts: string[];
};

export function LinkedInAssistPanel({ defaultNiche = "", defaultAudience = "" }: { defaultNiche?: string; defaultAudience?: string }) {
  const [niche, setNiche] = useState(defaultNiche);
  const [audience, setAudience] = useState(defaultAudience);
  const [leadContext, setLeadContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Suggestions | null>(null);
  const [remaining, setRemaining] = useState<number | null>(null);

  const run = async () => {
    if (!niche.trim()) {
      toast.error("Tell us your niche first");
      return;
    }
    setLoading(true);
    setResult(null);
    const { data, error } = await supabase.functions.invoke("linkedin-assist", {
      body: { niche, audience, leadContext },
    });
    setLoading(false);
    if (error || data?.error) {
      toast.error(data?.error || error?.message || "Failed");
      return;
    }
    setResult(data.suggestions);
    if (typeof data.remaining === "number") setRemaining(data.remaining);
  };

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied");
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <Linkedin className="w-5 h-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">LinkedIn Assist</h3>
        </div>
        {remaining !== null && (
          <Badge variant="secondary">{remaining} left this week</Badge>
        )}
      </div>

      <div className="flex items-start gap-2 p-3 mb-4 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs">
        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
        <p>
          We never log into LinkedIn for you. We suggest groups + draft comments and DMs — you post and message yourself from your LinkedIn tab. Automated DMs and group messaging violate LinkedIn's TOS.
        </p>
      </div>

      <div className="space-y-3 mb-4">
        <Input placeholder="Your niche (e.g. boutique fitness studios)" value={niche} onChange={(e) => setNiche(e.target.value)} />
        <Input placeholder="Target audience (e.g. studio owners with 1-5 staff)" value={audience} onChange={(e) => setAudience(e.target.value)} />
        <Textarea
          placeholder="Optional: paste a recent post / bio / company blurb the AI should respond to"
          value={leadContext}
          onChange={(e) => setLeadContext(e.target.value)}
          rows={3}
        />
        <Button onClick={run} disabled={loading} className="w-full">
          {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
          {loading ? "Thinking…" : "Generate suggestions"}
        </Button>
      </div>

      {result && (
        <div className="space-y-5">
          <section>
            <h4 className="font-semibold text-foreground mb-2">Groups to search on LinkedIn</h4>
            <div className="space-y-2">
              {result.groups?.map((g, i) => (
                <div key={i} className="flex items-center justify-between gap-2 p-2 rounded border bg-card">
                  <span className="text-sm text-foreground">{g.name}</span>
                  <a href={g.search_url} target="_blank" rel="noreferrer">
                    <Button variant="ghost" size="sm" className="gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5" /> Open
                    </Button>
                  </a>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="font-semibold text-foreground mb-2">Comment drafts</h4>
            <div className="space-y-2">
              {result.comment_drafts?.map((c, i) => (
                <div key={i} className="flex items-start justify-between gap-2 p-3 rounded border bg-card">
                  <p className="text-sm text-foreground flex-1">{c}</p>
                  <Button variant="ghost" size="sm" onClick={() => copy(c)}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h4 className="font-semibold text-foreground mb-2">DM openers</h4>
            <div className="space-y-2">
              {result.dm_drafts?.map((c, i) => (
                <div key={i} className="flex items-start justify-between gap-2 p-3 rounded border bg-card">
                  <p className="text-sm text-foreground flex-1 whitespace-pre-line">{c}</p>
                  <Button variant="ghost" size="sm" onClick={() => copy(c)}>
                    <Copy className="w-3.5 h-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </Card>
  );
}
