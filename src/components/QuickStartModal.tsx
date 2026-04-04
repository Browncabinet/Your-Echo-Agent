import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, ArrowRight, Pencil, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { type Campaign, createEmptyCampaign } from "@/lib/campaign-data";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStartCampaign: (campaign: Campaign, skipSetup?: boolean) => void;
};

type DetectedData = {
  name: string;
  niche: string;
  goal: string;
  targetAudience: string[];
  businessSummary: string;
};

export function QuickStartModal({ open, onOpenChange, onStartCampaign }: Props) {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<"input" | "detecting" | "confirm">("input");
  const [detected, setDetected] = useState<DetectedData | null>(null);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleDetect = async () => {
    if (!url.trim()) return;

    setPhase("detecting");
    setError(null);

    try {
      // Try to scrape the URL first for better detection
      let scrapedContent = "";
      try {
        const { data: scrapeData } = await supabase.functions.invoke("firecrawl-scrape", {
          body: { url: url.trim(), options: { formats: ["markdown"], onlyMainContent: true } },
        });
        scrapedContent = scrapeData?.data?.markdown || scrapeData?.markdown || "";
      } catch {
        // Scraping is optional — continue without it
      }

      const { data, error: fnError } = await supabase.functions.invoke("quick-start-detect", {
        body: { url: url.trim(), scrapedContent },
      });

      if (fnError) throw fnError;
      if (data?.error) throw new Error(data.error);

      setDetected(data);
      setPhase("confirm");
    } catch (e: any) {
      setError("Couldn't read that URL. Please try again or use the full New Campaign form.");
      setPhase("input");
    }
  };

  const handleConfirm = () => {
    if (!detected) return;

    const campaign: Campaign = {
      ...createEmptyCampaign(),
      name: detected.name,
      goal: detected.goal,
      websiteUrl: url.trim(),
      niche: detected.niche,
      targetAudience: detected.targetAudience,
    };

    onStartCampaign(campaign);
    // Reset for next use
    setUrl("");
    setPhase("input");
    setDetected(null);
  };

  const updateDetected = (field: keyof DetectedData, value: string | string[]) => {
    if (detected) setDetected({ ...detected, [field]: value });
    setEditingField(null);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) { setPhase("input"); setError(null); } }}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            Quick Start
          </DialogTitle>
          <DialogDescription>
            Zero forms. Just paste your URL and let AI do the rest.
          </DialogDescription>
        </DialogHeader>

        {phase === "input" && (
          <div className="space-y-4 pt-2">
            <div>
              <Input
                type="url"
                placeholder="https://yourwebsite.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDetect()}
                className="text-base h-12"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-2">
                We'll analyze your site and auto-detect your niche, audience, and campaign goal.
              </p>
            </div>
            {error && (
              <div className="space-y-2">
                <p className="text-sm text-destructive">{error}</p>
                <Button variant="outline" size="sm" onClick={() => setError(null)}>Try Again</Button>
              </div>
            )}
            <Button onClick={handleDetect} disabled={!url.trim()} className="w-full gap-2" size="lg">
              <Sparkles className="w-4 h-4" /> Detect My Business
            </Button>
          </div>
        )}

        {phase === "detecting" && (
          <div className="flex flex-col items-center gap-4 py-10">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <div className="text-center">
              <p className="font-medium text-foreground">Understanding your offer…</p>
              <p className="text-sm text-muted-foreground mt-1">Finding your ideal customers and crafting your campaign</p>
            </div>
          </div>
        )}

        {phase === "confirm" && detected && (
          <div className="space-y-4 pt-2">
            <p className="text-sm text-muted-foreground">{detected.businessSummary}</p>

            <ConfirmField
              label="Campaign Name"
              value={detected.name}
              editing={editingField === "name"}
              onEdit={() => setEditingField("name")}
              onSave={(v) => updateDetected("name", v)}
            />
            <ConfirmField
              label="Niche"
              value={detected.niche}
              editing={editingField === "niche"}
              onEdit={() => setEditingField("niche")}
              onSave={(v) => updateDetected("niche", v)}
            />
            <ConfirmField
              label="Goal"
              value={detected.goal}
              editing={editingField === "goal"}
              onEdit={() => setEditingField("goal")}
              onSave={(v) => updateDetected("goal", v)}
            />

            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1.5">Target Audience</p>
              <div className="flex flex-wrap gap-1.5">
                {detected.targetAudience.map((a, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">{a}</Badge>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <Button variant="outline" onClick={() => { setPhase("input"); setDetected(null); }} className="flex-1">
                Try Another URL
              </Button>
              <Button variant="ghost" onClick={() => {
                const c: Campaign = { ...createEmptyCampaign(), name: detected.name, goal: detected.goal, websiteUrl: url.trim(), niche: detected.niche, targetAudience: detected.targetAudience };
                onStartCampaign({ ...c } as any);
                // Override to go to step 0 (full form) by dispatching with status
                setCampaign?.(c);
              }} className="flex-1 text-muted-foreground">
                Use Full Form Instead
              </Button>
              <Button onClick={handleConfirm} className="flex-1 gap-2">
                Looks Good — Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function ConfirmField({ label, value, editing, onEdit, onSave }: {
  label: string;
  value: string;
  editing: boolean;
  onEdit: () => void;
  onSave: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);

  if (editing) {
    return (
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">{label}</p>
        <div className="flex gap-2">
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            className="text-sm h-9"
            autoFocus
            onKeyDown={(e) => e.key === "Enter" && onSave(draft)}
          />
          <Button size="sm" variant="ghost" onClick={() => onSave(draft)} className="h-9 px-2">
            <Check className="w-4 h-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-2">
      <div>
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className="text-sm text-foreground">{value}</p>
      </div>
      <Button size="sm" variant="ghost" onClick={onEdit} className="h-7 px-2 text-muted-foreground">
        <Pencil className="w-3 h-3" />
      </Button>
    </div>
  );
}
