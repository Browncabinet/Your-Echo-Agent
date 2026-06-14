import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, ArrowRight, Sparkles, Minus, Info } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { TopupPacks, type TopupPack } from "@/components/TopupPacks";
import { TopupCheckoutDialog } from "@/components/TopupCheckoutDialog";
import { useAuth } from "@/contexts/AuthContext";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type ComparisonRow = {
  feature: string;
  starter: boolean | string;
  growth: boolean | string;
  power: boolean | string;
};

const comparisonRows: ComparisonRow[] = [
  { feature: "Emails / week", starter: "500", growth: "1,500", power: "4,000" },
  { feature: "LinkedIn Assist drafts / week", starter: "50", growth: "150", power: "400" },
  { feature: "Echo Agent + Reply Handler", starter: true, growth: true, power: true },
  { feature: "Niche-first targeting", starter: true, growth: true, power: true },
  { feature: "Smart Reply Handling", starter: true, growth: true, power: true },
  { feature: "Priority sending queue", starter: true, growth: true, power: true },
  { feature: "Analytics + tracking", starter: true, growth: true, power: true },
  { feature: "Cancel or pause anytime", starter: true, growth: true, power: true },
];

function Cell({ value }: { value: boolean | string }) {
  if (typeof value === "string") {
    return <span className="text-sm font-medium text-foreground">{value}</span>;
  }
  return value ? (
    <Check className="w-4 h-4 text-primary mx-auto" />
  ) : (
    <Minus className="w-4 h-4 text-muted-foreground/50 mx-auto" />
  );
}

type WeeklyTier = {
  id: string;
  name: string;
  price: number;
  headline: string;
  description: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
};

const weeklyTiers: WeeklyTier[] = [
  {
    id: "starter_weekly",
    name: "Starter Weekly",
    price: 19,
    headline: "500 emails + 50 LinkedIn Assist actions",
    description: "Perfect for testing and your first campaign",
    features: [
      "500 emails / week",
      "50 LinkedIn Assist drafts / week",
      "Full Echo Agent + Reply Handler",
      "Niche-first targeting",
      "Cancel or pause anytime",
    ],
  },
  {
    id: "growth_weekly",
    name: "Growth Weekly",
    price: 39,
    headline: "1,500 emails + 150 LinkedIn Assist",
    description: "Best value for most users getting real results",
    features: [
      "1,500 emails / week",
      "150 LinkedIn Assist drafts / week",
      "Full Echo Agent + Reply Handler",
      "Priority sending queue",
      "Cancel or pause anytime",
    ],
    highlight: true,
    badge: "Most Popular",
  },
  {
    id: "power_weekly",
    name: "Power Weekly",
    price: 79,
    headline: "4,000 emails + 400 LinkedIn Assist",
    description: "For power users and agencies scaling fast",
    features: [
      "4,000 emails / week",
      "400 LinkedIn Assist drafts / week",
      "Full Echo Agent + Reply Handler",
      "Priority sending queue",
      "Cancel or pause anytime",
    ],
  },
];

export function HomePricingSection() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSavings, setShowSavings] = useState(false);
  const [topupPriceId, setTopupPriceId] = useState<TopupPack["priceId"] | null>(null);

  const handleTopup = (priceId: TopupPack["priceId"]) => {
    if (!user) {
      try { localStorage.setItem("pending_topup_priceId", priceId); } catch {/* ignore */}
      navigate("/auth");
      return;
    }
    setTopupPriceId(priceId);
  };

  return (
    <section className="mb-16 scroll-mt-20" id="pricing">
      <div className="text-center mb-6">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Start Small and Grow as You Go
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
          Flexible weekly packages. Cancel or pause anytime. No long-term commitments.
        </p>
        <p className="text-xs text-muted-foreground mt-3 max-w-xl mx-auto flex items-center justify-center gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>
            LinkedIn Assist = AI-drafted comments and DMs you post manually. We never log into LinkedIn for you.
          </span>
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

            <p className="text-xs font-medium text-primary mb-2">{tier.headline}</p>

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

      {/* Comparison table */}
      <Card className="p-2 sm:p-4 mb-8 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40%]">What's included</TableHead>
              <TableHead className="text-center">Starter</TableHead>
              <TableHead className="text-center">Growth</TableHead>
              <TableHead className="text-center">Power</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {comparisonRows.map((row) => (
              <TableRow key={row.feature}>
                <TableCell className="text-sm text-foreground">{row.feature}</TableCell>
                <TableCell className="text-center"><Cell value={row.starter} /></TableCell>
                <TableCell className="text-center"><Cell value={row.growth} /></TableCell>
                <TableCell className="text-center"><Cell value={row.power} /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Cost equivalent toggle */}
      <div className="flex flex-col items-center gap-3 mb-8">
        <div className="flex items-center gap-3">
          <span className={`text-sm font-medium ${!showSavings ? "text-foreground" : "text-muted-foreground"}`}>
            Weekly
          </span>
          <Switch checked={showSavings} onCheckedChange={setShowSavings} aria-label="Toggle cost equivalent" />
          <span className={`text-sm font-medium ${showSavings ? "text-foreground" : "text-muted-foreground"}`}>
            Cost Equivalent
          </span>
        </div>
        {showSavings && (
          <div className="text-center">
            <div className="flex flex-wrap justify-center gap-2 mt-1">
              <Badge variant="outline" className="text-xs">Starter ≈ $82/mo</Badge>
              <Badge variant="outline" className="text-xs">Growth ≈ $169/mo</Badge>
              <Badge variant="outline" className="text-xs">Power ≈ $342/mo</Badge>
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
          Most users start with the <span className="font-bold">$19 Starter Weekly</span> to test safely. Once they begin seeing replies, booked calls, and revenue, they upgrade to <span className="font-bold">Growth or Power</span>.
        </p>
      </Card>
    </section>
  );
}
