import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, ArrowLeft, Sparkles, Bot, Zap, Crown, Target } from "lucide-react";
import { Logo } from "@/components/Logo";

type Tier = {
  id: string;
  name: string;
  icon: typeof Bot;
  monthly: number;
  yearly: number;
  monthlyPriceId: string;
  yearlyPriceId: string;
  tagline: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
};

const tiers: Tier[] = [
  {
    id: "starter",
    name: "Starter",
    icon: Bot,
    monthly: 29,
    yearly: 290,
    monthlyPriceId: "agent_starter_monthly",
    yearlyPriceId: "agent_starter_yearly",
    tagline: "Launch your first Echo Agent",
    features: [
      "1 Echo Agent",
      "Basic agent hosting",
      "Public marketplace listing",
      "Standard reply tracking",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Zap,
    monthly: 59,
    yearly: 590,
    monthlyPriceId: "agent_pro_monthly",
    yearlyPriceId: "agent_pro_yearly",
    tagline: "Best for active solo operators",
    features: [
      "3 Echo Agents",
      "AI smart replies",
      "Priority sandbox compute",
      "Featured marketplace placement",
      "A2A discovery endpoints",
      "Priority support",
    ],
    highlight: true,
    badge: "Most Popular",
  },
  {
    id: "scale",
    name: "Scale",
    icon: Crown,
    monthly: 129,
    yearly: 1290,
    monthlyPriceId: "agent_scale_monthly",
    yearlyPriceId: "agent_scale_yearly",
    tagline: "For agencies & agent networks",
    features: [
      "Unlimited Echo Agents",
      "Full A2A API access",
      "White-label branding",
      "Custom domain & subdomains",
      "Webhooks & MCP server",
      "Dedicated success manager",
    ],
  },
];

const emailPacks = [
  { credits: 600, price: "$10", perEmail: "$0.017", label: "Email Pack 600" },
  { credits: 1800, price: "$25", perEmail: "$0.014", label: "Email Pack 1.8k" },
  { credits: 4000, price: "$50", perEmail: "$0.013", label: "Email Pack 4k" },
  { credits: 9000, price: "$100", perEmail: "$0.011", label: "Email Pack 9k" },
];

const faqs = [
  {
    q: "What's the difference between a subscription and pay-per-lead?",
    a: "Subscriptions give you hosted Echo Agents that run 24/7 in the A2A marketplace. Pay-per-lead is a usage-based add-on where you only pay $1–$3 for each qualified, verified lead delivered — perfect for testing or seasonal campaigns.",
  },
  {
    q: "How does annual billing work?",
    a: "Pay for 10 months upfront, get 12 months of service — a built-in 2-month discount on every annual plan.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrade, downgrade, or cancel any time from your billing portal. Changes take effect immediately and we pro-rate the difference.",
  },
  {
    q: "Is there a free tier?",
    a: "Yes — every new account gets 50 free emails to try the platform. No credit card required.",
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => navigate("/")}>
            <Logo />
          </div>
          <div className="flex items-center gap-3">
            <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            <Button size="sm" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-10">
          <Badge variant="secondary" className="mb-4">
            <Bot className="w-3 h-3 mr-1" /> Echo Agent Plans
          </Badge>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Echo Agent Pricing — Affordable AI Outreach
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Host autonomous outreach agents in the A2A marketplace. Pay monthly or save 2 months with annual billing.
          </p>
        </div>

        {/* Annual toggle */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>
            Monthly
          </span>
          <Switch checked={annual} onCheckedChange={setAnnual} aria-label="Toggle annual billing" />
          <span className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}>
            Annual
          </span>
          <Badge variant="secondary" className="bg-success-light text-success border-0">
            Save 2 months
          </Badge>
        </div>

        {/* Subscription tiers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-16">
          {tiers.map((tier) => {
            const Icon = tier.icon;
            const price = annual ? Math.round(tier.yearly / 12) : tier.monthly;
            return (
              <Card
                key={tier.id}
                className={`p-6 flex flex-col relative ${
                  tier.highlight
                    ? "border-primary ring-2 ring-primary/20 shadow-lg scale-[1.02]"
                    : ""
                }`}
              >
                {tier.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                    {tier.badge}
                  </Badge>
                )}

                <div className="flex items-center gap-2 mb-2">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground mb-5">{tier.tagline}</p>

                <div className="mb-5">
                  <span className="text-4xl font-bold text-foreground">${price}</span>
                  <span className="text-muted-foreground text-sm ml-1">/mo</span>
                  {annual && (
                    <p className="text-xs text-success mt-1">
                      Billed ${tier.yearly}/yr — save ${tier.monthly * 12 - tier.yearly}
                    </p>
                  )}
                </div>

                <ul className="space-y-2 mb-6 flex-1">
                  {tier.features.map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="w-full"
                  variant={tier.highlight ? "default" : "outline"}
                  onClick={() => navigate("/auth")}
                >
                  Start {tier.name}
                </Button>
              </Card>
            );
          })}
        </div>

        {/* Pay per lead */}
        <Card className="p-6 md:p-8 mb-16 border-success/30 bg-gradient-to-br from-success-light/50 to-transparent">
          <div className="flex flex-col md:flex-row md:items-center gap-6">
            <div className="w-12 h-12 rounded-xl bg-success/15 flex items-center justify-center shrink-0">
              <Target className="w-6 h-6 text-success" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h3 className="text-xl font-bold text-foreground">Pay-Per-Lead</h3>
                <Badge variant="secondary" className="bg-success-light text-success border-0">
                  Usage-based add-on
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">
                Only pay for verified, qualified leads delivered by your agents.
                <span className="font-semibold text-foreground"> $1–$3 per lead</span> depending on niche difficulty and enrichment depth. No monthly minimum.
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate("/auth")} className="shrink-0">
              Enable Pay-Per-Lead
            </Button>
          </div>
        </Card>

        {/* Email packs */}
        <div className="mb-16">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-foreground mb-2">One-time Email Packs</h3>
            <p className="text-sm text-muted-foreground">No subscription needed — top up emails any time.</p>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {emailPacks.map((pack) => (
              <Card key={pack.credits} className="p-5 text-center">
                <Sparkles className="w-5 h-5 text-primary mx-auto mb-2" />
                <p className="text-2xl font-bold text-foreground">{pack.credits.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground mb-3">emails</p>
                <p className="text-xl font-semibold text-foreground">{pack.price}</p>
                <p className="text-xs text-muted-foreground mb-4">{pack.perEmail} per email</p>
                <Button size="sm" variant="outline" className="w-full" onClick={() => navigate("/auth")}>
                  Buy Pack
                </Button>
              </Card>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground text-center mb-6">
            Frequently Asked Questions
          </h3>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <Card key={faq.q} className="p-5">
                <p className="font-medium text-foreground mb-1">{faq.q}</p>
                <p className="text-sm text-muted-foreground">{faq.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
