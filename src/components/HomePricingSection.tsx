import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

type WeeklyTier = {
  id: string;
  name: string;
  price: number;
  messages: string;
  description: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
};

const weeklyTiers: WeeklyTier[] = [
  {
    id: "starter_weekly",
    name: "Starter Weekly",
    price: 15,
    messages: "600–700 LinkedIn messages",
    description: "Perfect for testing and trying your first campaign",
    features: [
      "600–700 messages / week",
      "1 Echo Agent",
      "Niche targeting",
      "Cancel or pause anytime",
    ],
  },
  {
    id: "growth_weekly",
    name: "Growth Weekly",
    price: 35,
    messages: "1,800–2,000 messages per week",
    description: "Best value for most users getting real results",
    features: [
      "1,800–2,000 messages / week",
      "Smart Reply Handling",
      "Priority sending queue",
      "Cancel or pause anytime",
    ],
    highlight: true,
    badge: "Most Popular",
  },
  {
    id: "power_weekly",
    name: "Power Weekly",
    price: 69,
    messages: "4,000+ messages per week",
    description: "For power users and agencies scaling fast",
    features: [
      "4,000+ messages / week",
      "Full A2A API access",
      "Priority hosting",
      "Cancel or pause anytime",
    ],
  },
];

export function HomePricingSection() {
  const navigate = useNavigate();
  const [showSavings, setShowSavings] = useState(false);

  return (
    <section className="mb-16 scroll-mt-20" id="pricing">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Start Small and Grow as You Go
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
          Flexible weekly packages. Cancel or pause anytime. No long-term commitments.
        </p>
      </div>

      {/* Weekly Plans */}
      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        {weeklyTiers.map((tier) => (
          <Card
            key={tier.id}
            className={`p-5 flex flex-col relative ${
              tier.highlight ? "border-primary shadow-lg ring-1 ring-primary/30" : ""
            }`}
          >
            {/* Cancel badge on every plan */}
            <Badge
              variant="secondary"
              className="absolute -top-2 right-3 text-[10px] border-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
            >
              Cancel anytime
            </Badge>

            {tier.badge && <Badge className="mb-2 self-start">{tier.badge}</Badge>}

            <h4 className="text-lg font-bold text-foreground">{tier.name}</h4>
            <p className="text-xs text-muted-foreground mb-2">{tier.description}</p>

            <div className="mb-3">
              <span className="text-3xl font-bold text-foreground">${tier.price}</span>
              <span className="text-muted-foreground text-sm">/wk</span>
            </div>

            <p className="text-xs font-medium text-primary mb-2">{tier.messages}</p>

            <ul className="space-y-1.5 mb-5 flex-1">
              {tier.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>

            <Button
              variant={tier.highlight ? "default" : "outline"}
              onClick={() => navigate("/pricing")}
              className="w-full"
            >
              Start {tier.name.split(" ")[0]} <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </Button>
          </Card>
        ))}
      </div>

      {/* Monthly equivalent toggle */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${!showSavings ? "text-foreground" : "text-muted-foreground"}`}>
            Weekly
          </span>
          <Switch checked={showSavings} onCheckedChange={setShowSavings} aria-label="Toggle monthly equivalent" />
          <span className={`text-sm font-medium ${showSavings ? "text-foreground" : "text-muted-foreground"}`}>
            Monthly Equivalent
          </span>
        </div>
        {showSavings && (
          <div className="text-center">
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">Starter ≈ $60/mo</Badge>
              <Badge variant="outline" className="text-xs">Growth ≈ $140/mo</Badge>
              <Badge variant="outline" className="text-xs">Power ≈ $276/mo</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2 max-w-md mx-auto">
              Weekly keeps you flexible. No annual contract needed.
            </p>
          </div>
        )}
      </div>

      {/* Strong note */}
      <Card className="p-5 border-primary/30 bg-primary/5 text-center">
        <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
        <p className="text-sm text-foreground leading-relaxed">
          Most users start with the <span className="font-bold">$15 Starter Weekly</span> to test safely. Once they begin seeing replies, booked calls, and revenue, they upgrade to <span className="font-bold">Growth or Power</span>.
        </p>
      </Card>
    </section>
  );
}
