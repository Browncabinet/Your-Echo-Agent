import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";
import { ArrowRight, ArrowLeft, Loader2, Check, Link2 } from "lucide-react";
import { type Campaign, generateSampleLeads } from "@/lib/campaign-data";

type Props = {
  campaign: Campaign;
  onUpdate: (c: Partial<Campaign>) => void;
  onNext: () => void;
  onBack: () => void;
};

export function LeadAcquisition({ campaign, onUpdate, onNext, onBack }: Props) {
  const [url, setUrl] = useState("");
  const [scraping, setScraping] = useState(false);
  const [progress, setProgress] = useState<string[]>([]);
  const [fields, setFields] = useState({ name: true, company: true, email: true, linkedin: false });

  const handleScrape = async () => {
    if (!url.trim()) return;
    setScraping(true);
    setProgress([]);

    await new Promise((r) => setTimeout(r, 1200));
    setProgress(["Finding leads..."]);

    await new Promise((r) => setTimeout(r, 1500));
    setProgress((p) => [...p, "Finding leads ✓"]);
    setProgress((p) => [...p, "Extracting data..."]);

    await new Promise((r) => setTimeout(r, 1800));
    setProgress((p) => [...p, "Extracting data ✓"]);

    const leads = generateSampleLeads(15);
    onUpdate({ leads });
    setScraping(false);
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h2 className="text-xl font-bold text-foreground">Find Your Leads</h2>
        <p className="text-sm text-muted-foreground mt-1">Paste a URL and we'll extract contact info automatically.</p>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Paste a URL (directory, Google search, association page, etc.)</Label>
          <div className="flex gap-2 mt-1.5">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="https://example.com/directory"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button onClick={handleScrape} disabled={scraping || !url.trim()}>
              {scraping ? <Loader2 className="w-4 h-4 animate-spin" /> : "Scrape"}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-1">Free version: up to 500 contacts</p>
        </div>

        {progress.length > 0 && (
          <Card className="p-4 space-y-2">
            {progress.map((p, i) => (
              <div key={i} className="flex items-center gap-2 text-sm">
                {p.includes("✓") ? (
                  <Check className="w-4 h-4 text-success flex-shrink-0" />
                ) : (
                  <Loader2 className="w-4 h-4 animate-spin text-primary flex-shrink-0" />
                )}
                <span className={p.includes("✓") ? "text-success font-medium" : "text-foreground"}>
                  {p.replace(" ✓", "")}
                </span>
              </div>
            ))}
          </Card>
        )}

        <div>
          <Label className="mb-2 block">Data Fields to Extract</Label>
          <div className="flex flex-wrap gap-4">
            {Object.entries(fields).map(([key, val]) => (
              <label key={key} className="flex items-center gap-2 text-sm cursor-pointer">
                <Checkbox
                  checked={val}
                  disabled={key === "email"}
                  onCheckedChange={(v) => setFields((f) => ({ ...f, [key]: !!v }))}
                />
                <span className="capitalize">{key === "linkedin" ? "LinkedIn Profile" : key}</span>
                {key === "email" && <span className="text-xs text-muted-foreground">(required)</span>}
              </label>
            ))}
          </div>
        </div>

        {campaign.leads.length > 0 && (
          <Card className="p-4 bg-success-light border-success/20">
            <p className="text-sm font-medium text-success">
              ✓ {campaign.leads.length} leads found and ready!
            </p>
          </Card>
        )}
      </div>

      <div className="flex gap-3">
        <Button variant="outline" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>
        <Button onClick={onNext} disabled={campaign.leads.length === 0} size="lg" className="gap-2">
          Build Email Campaign <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
