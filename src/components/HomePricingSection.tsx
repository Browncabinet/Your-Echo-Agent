import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Coins, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const tiers = [
  {
    name: "Starter",
    price: 29,
    blurb: "For solo founders testing outreach.",
    features: ["500 emails / month", "1 Echo Agent", "Reply handling", "Basic analytics"],
    cta: "Start Starter",
    highlight: false,
  },
  {
    name: "Pro",
    price: 59,
    blurb: "For growing teams sending real volume.",
    features: ["2,000 emails / month", "3 Echo Agents", "A2A marketplace access", "Priority support"],
    cta: "Go Pro",
    highlight: true,
  },
  {
    name: "Scale",
    price: 129,
    blurb: "For agencies and busy operators.",
    features: ["6,000 emails / month", "Unlimited Echo Agents", "Custom agent training", "Dedicated success manager"],
    cta: "Scale Up",
    highlight: false,
  },
];

export function HomePricingSection() {
  const navigate = useNavigate();
  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <Badge variant="secondary" className="mb-3">
          <Sparkles className="w-3 h-3 mr-1" /> Simple Pricing
        </Badge>
        <h2 className="text-3xl font-bold text-foreground">Plans for humans & agents</h2>
        <p className="text-muted-foreground mt-2 text-sm max-w-xl mx-auto">
          Monthly plans for predictable outreach, or pay-per-lead if you'd rather only pay for results.
        </p>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {tiers.map((t) => (
          <Card
            key={t.name}
            className={`p-6 flex flex-col ${
              t.highlight ? "border-primary shadow-lg ring-1 ring-primary/30" : ""
            }`}
          >
            {t.highlight && (
              <Badge className="self-start mb-2">Most popular</Badge>
            )}
            <h3 className="text-xl font-bold text-foreground">{t.name}</h3>
            <p className="text-sm text-muted-foreground mt-1">{t.blurb}</p>
            <div className="mt-4 mb-4">
              <span className="text-4xl font-bold text-foreground">${t.price}</span>
              <span className="text-muted-foreground text-sm">/mo</span>
            </div>
            <ul className="space-y-2 mb-6 flex-1">
              {t.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              variant={t.highlight ? "default" : "outline"}
              onClick={() => navigate("/pricing")}
              className="w-full"
            >
              {t.cta}
            </Button>
          </Card>
        ))}
      </div>

      <Card className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-accent/5 border-accent/30">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-accent/10">
            <Coins className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Pay-Per-Lead</h3>
            <p className="text-sm text-muted-foreground">
              No subscription. From $0.10 per personalized, sent lead. Perfect for agents hiring on demand.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate("/pricing")}>
          See Pay-Per-Lead
        </Button>
      </Card>
    </section>
  );
}
