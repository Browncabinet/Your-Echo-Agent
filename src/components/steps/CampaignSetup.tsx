import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search, X, Plus } from "lucide-react";
import { NICHES, TARGET_AUDIENCES, type Campaign } from "@/lib/campaign-data";

type Props = {
  campaign: Campaign;
  onUpdate: (c: Partial<Campaign>) => void;
  onNext: () => void;
};

export function CampaignSetup({ campaign, onUpdate, onNext }: Props) {
  const [customSub, setCustomSub] = useState("");
  const [sellingPointInput, setSellingPointInput] = useState("");
  const subcats = TARGET_AUDIENCES[campaign.niche] || [];

  const isValid = campaign.name.trim() && campaign.goal.trim() && campaign.niche && campaign.targetAudience.length > 0;

  const addSellingPoint = () => {
    const point = sellingPointInput.trim();
    if (point && !campaign.sellingPoints?.includes(point) && (campaign.sellingPoints?.length || 0) < 5) {
      onUpdate({ sellingPoints: [...(campaign.sellingPoints || []), point] });
      setSellingPointInput("");
    }
  };

  const removeSellingPoint = (point: string) => {
    onUpdate({ sellingPoints: (campaign.sellingPoints || []).filter((p) => p !== point) });
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Set Up Your Campaign</h2>
        <p className="text-sm text-muted-foreground mt-1">Tell us about your outreach goal.</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Campaign Name</Label>
          <Input
            id="name"
            placeholder='e.g. "Q1 Real Estate Outreach"'
            value={campaign.name}
            onChange={(e) => onUpdate({ name: e.target.value })}
            className="mt-1.5"
          />
        </div>

        <div>
          <Label htmlFor="goal">Campaign Goal</Label>
          <Input
            id="goal"
            placeholder='e.g. "Get 200 sign-ups for our new platform"'
            value={campaign.goal}
            onChange={(e) => onUpdate({ goal: e.target.value })}
            className="mt-1.5"
          />
        </div>

        <div className="space-y-3">
          <div>
            <Label>Key Selling Points</Label>
            <p className="text-xs text-muted-foreground mt-0.5">
              Add details you want included in your emails (e.g. features, benefits, offers). Press Enter to add.
            </p>
          </div>
          <div className="relative">
            <Plus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder='e.g. "AI-powered lead scoring saves 5 hours/week"'
              value={sellingPointInput}
              onChange={(e) => setSellingPointInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addSellingPoint();
                }
              }}
              className="pl-10"
              disabled={(campaign.sellingPoints?.length || 0) >= 5}
            />
          </div>
          {(campaign.sellingPoints?.length || 0) > 0 && (
            <div className="flex flex-wrap gap-2">
              {campaign.sellingPoints.map((point) => (
                <Badge
                  key={point}
                  variant="default"
                  className="gap-1 pr-1.5 cursor-default"
                >
                  {point}
                  <button
                    onClick={() => removeSellingPoint(point)}
                    className="ml-1 rounded-full hover:bg-primary-foreground/20 p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            {campaign.sellingPoints?.length || 0}/5 points added
          </p>
        </div>

        <div>
          <Label htmlFor="websiteUrl">Your Website URL</Label>
          <Input
            id="websiteUrl"
            type="url"
            placeholder="https://yourapp.com"
            value={campaign.websiteUrl}
            onChange={(e) => onUpdate({ websiteUrl: e.target.value })}
            className="mt-1.5"
          />
          <p className="text-xs text-muted-foreground mt-1">So the AI can personalize emails to match your business</p>
        </div>

        <div>
          <Label>Main Niche</Label>
          <Select value={campaign.niche} onValueChange={(v) => onUpdate({ niche: v, targetAudience: [] })}>
            <SelectTrigger className="mt-1.5">
              <SelectValue placeholder="Select a niche..." />
            </SelectTrigger>
            <SelectContent>
              {NICHES.map((n) => (
                <SelectItem key={n} value={n}>{n}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {campaign.niche && (
          <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <Label>Target Audience</Label>
            {subcats.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {subcats.map((s) => {
                  const selected = campaign.targetAudience.includes(s);
                  return (
                    <Badge
                      key={s}
                      variant={selected ? "default" : "outline"}
                      className="cursor-pointer transition-all hover:scale-105"
                      onClick={() =>
                        onUpdate({
                          targetAudience: selected
                            ? campaign.targetAudience.filter((a) => a !== s)
                            : [...campaign.targetAudience, s],
                        })
                      }
                    >
                      {s}
                    </Badge>
                  );
                })}
              </div>
            )}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search or type your target audience..."
                value={customSub}
                onChange={(e) => setCustomSub(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && customSub.trim() && !campaign.targetAudience.includes(customSub.trim())) {
                    onUpdate({ targetAudience: [...campaign.targetAudience, customSub.trim()] });
                    setCustomSub("");
                  }
                }}
                className="pl-10"
              />
            </div>
            {campaign.targetAudience.length > 0 && (
              <p className="text-sm text-success font-medium">✓ Selected: {campaign.targetAudience.join(", ")}</p>
            )}
          </div>
        )}
      </div>

      <Button onClick={onNext} disabled={!isValid} size="lg" className="gap-2">
        Continue to Lead Acquisition <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
