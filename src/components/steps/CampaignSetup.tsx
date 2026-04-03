import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Search } from "lucide-react";
import { NICHES, TARGET_AUDIENCES, type Campaign } from "@/lib/campaign-data";

type Props = {
  campaign: Campaign;
  onUpdate: (c: Partial<Campaign>) => void;
  onNext: () => void;
};

export function CampaignSetup({ campaign, onUpdate, onNext }: Props) {
  const [customSub, setCustomSub] = useState("");
  const subcats = TARGET_AUDIENCES[campaign.niche] || [];

  const isValid = campaign.name.trim() && campaign.goal.trim() && campaign.niche && campaign.targetAudience.length > 0;

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
            placeholder='e.g. "Get 30 real estate agents to try AIRealtorReply"'
            value={campaign.goal}
            onChange={(e) => onUpdate({ goal: e.target.value })}
            className="mt-1.5"
          />
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
                  if (e.key === "Enter" && customSub.trim()) {
                    onUpdate({ targetAudience: customSub.trim() });
                    setCustomSub("");
                  }
                }}
                className="pl-10"
              />
            </div>
            {campaign.targetAudience && (
              <p className="text-sm text-success font-medium">✓ Selected: {campaign.targetAudience}</p>
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
