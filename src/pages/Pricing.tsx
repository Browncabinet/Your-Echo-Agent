import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, ArrowLeft, Sparkles, Bot, Zap, Crown, CalendarClock, Rocket } from "lucide-react";
import { Logo } from "@/components/Logo";

type Pack = {
  id: string;
  price: string;
  priceId: string;
  messages: string;
  niches: string;
  badge?: string;
  highlight?: boolean;
};

const packs: Pack[] = [
  {
    id: "pack_9",
    price: "$9",
    priceId: "pack_starter_9",
    messages: "250 LinkedIn messages",
    niches: "1 Niche List",
  },
  {
    id: "pack_25",
    price: "$25",
    priceId: "pack_best_25",
    messages: "1,000 LinkedIn messages",
    niches: "1 Niche List",
    badge: "Best Starter Pack",
    highlight: true,
  },
  {
    id: "pack_49",
    price: "$49",
    priceId: "pack_pro_49",
    messages: "2,500 LinkedIn messages",
    niches: "2 Niche Lists",
  },
];

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
    yearly: 279,
    monthlyPriceId: "agent_starter_monthly",
    yearlyPriceId: "agent_starter_yearly",
    tagline: "Consistent outreach for solo founders",
    features: [
      "2,500 messages / month",
      "Full Echo Agent features",
      "Reply handling",
      "Email support",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    icon: Zap,
    monthly: 59,
    yearly: 567,
    monthlyPriceId: "agent_pro_monthly",
    yearlyPriceId: "agent_pro_yearly",
    tagline: "For users seeing real replies & meetings",
    features: [
      "8,000 messages / month",
      "Smart AI Replies",
      "Priority sending",
      "Featured marketplace placement",
      "Priority support",
    ],
    highlight: true,
    badge: "Most Popular",
  },
  {
    id: "scale",
    name: "Scale",
    icon: Crown,
    monthly: 119,
    yearly: 1143,
    monthlyPriceId: "agent_scale_monthly",
    yearlyPriceId: "agent_scale_yearly",
    tagline: "For agencies & agent networks",
    features: [
      "Unlimited messages",
      "Full A2A API access",
      "Dedicated hosting",
      "White-label branding",
      "Dedicated success manager",
    ],
  },
];

const faqs = [
  {
    q: "Why no free tier?",
    a: "Free tiers attract spam and noisy testers. A $9 pack keeps everyone serious while still being lower-risk than a coffee. You only scale up when you're actually getting replies.",
  },
  {
    q: "Should I start with a pack or a plan?",
    a: "Start with a $9 or $25 pack. Test your voice and niche safely. Once replies and booked calls start rolling in, move to Weekly or Monthly for the better per-message rate.",
  },
  {
    q: "How does annual billing work?",
    a: "Pay annually and save 20% on any monthly plan. Cancel any time from your billing portal.",
  },
  {
    q: "Can I pause my Weekly plan?",
    a: "Yes — Weekly plans renew every 7 days. Pause or cancel any time from your dashboard, no questions asked.",
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
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" /> No-Barrier Pricing
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
            Start with Zero Pressure — Test Today, Scale Only When You See Results
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            No big monthly commitments. No free tier. Just simple packs to test your Echo Agent. Upgrade to weekly or monthly only when you're getting replies and booked calls.
          </p>
        </div>

        {/* Pay-As-You-Go Packs — HERO SECTION */}
        <section className="mb-20">
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-primary text-primary-foreground">Start Here</Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Pay-As-You-Go Packs
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              One-time payment. No subscription. Test your niche, see real replies, then decide.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {packs.map((pack) => (
              <Card
                key={pack.id}
                className={`p-8 flex flex-col relative transition-all ${
                  pack.highlight
                    ? "border-primary ring-4 ring-primary/20 shadow-xl md:scale-105 bg-gradient-to-br from-primary/5 to-transparent"
                    : "hover:border-primary/40 hover:shadow-md"
                }`}
              >
                {pack.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1">
                    <Sparkles className="w-3 h-3 mr-1" /> {pack.badge}
                  </Badge>
                )}

                <div className="text-center mb-6">
                  <p className="text-5xl sm:text-6xl font-bold text-foreground mb-1">{pack.price}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">one-time</p>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="font-medium">{pack.messages}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>{pack.niches}</span>
                  </li>
                  <li className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span>No subscription, no auto-renew</span>
                  </li>
                </ul>

                <Button
                  size="lg"
                  variant={pack.highlight ? "default" : "outline"}
                  className="w-full"
                  onClick={() => navigate("/auth")}
                >
                  Buy Pack
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Weekly Plans */}
        <section className="mb-20">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-3">
              <CalendarClock className="w-3 h-3 mr-1" /> Flexible & Low Commitment
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Weekly Plans</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              For users seeing early results who want to keep momentum — without a monthly lock-in.
            </p>
          </div>

          <Card className="p-8 max-w-2xl mx-auto border-accent/40 bg-gradient-to-br from-accent/5 to-transparent">
            <div className="flex flex-col sm:flex-row sm:items-center gap-6">
              <div className="flex-1">
                <div className="flex items-baseline gap-2 mb-2">
                  <span className="text-4xl font-bold text-foreground">$39</span>
                  <span className="text-muted-foreground">per week</span>
                </div>
                <ul className="space-y-2 text-sm text-foreground">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>~1,200 messages per week</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Auto-renews every 7 days</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>Pause or cancel any time, no questions</span>
                  </li>
                </ul>
              </div>
              <Button size="lg" className="sm:shrink-0" onClick={() => navigate("/auth")}>
                Start Weekly
              </Button>
            </div>
          </Card>
        </section>

        {/* Monthly Plans */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <Badge variant="secondary" className="mb-3">
              <Rocket className="w-3 h-3 mr-1" /> For Consistent Growth
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Monthly Plans</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              When outreach is paying off, lock in the best per-message rate.
            </p>
          </div>

          {/* Monthly / Annual toggle */}
          <div className="flex items-center justify-center gap-3 mb-10">
            <span className={`text-sm font-medium ${!annual ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <Switch checked={annual} onCheckedChange={setAnnual} aria-label="Toggle annual billing" />
            <span className={`text-sm font-medium ${annual ? "text-foreground" : "text-muted-foreground"}`}>
              Annual
            </span>
            <Badge variant="secondary" className="bg-success-light text-success border-0">
              Save 20%
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {tiers.map((tier) => {
              const Icon = tier.icon;
              const price = annual ? Math.round(tier.yearly / 12) : tier.monthly;
              return (
                <Card
                  key={tier.id}
                  className={`p-6 flex flex-col relative ${
                    tier.highlight
                      ? "border-primary ring-2 ring-primary/20 shadow-lg md:scale-[1.02]"
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
        </section>

        {/* Important note */}
        <Card className="p-6 md:p-8 mb-16 max-w-3xl mx-auto border-primary/30 bg-primary/5 text-center">
          <Sparkles className="w-6 h-6 text-primary mx-auto mb-3" />
          <p className="text-foreground text-base sm:text-lg leading-relaxed">
            Most users start with a <span className="font-bold">$9 or $25 pack</span> to test safely in their niche. Once they start getting real responses and revenue, they upgrade to <span className="font-bold">Weekly or Monthly</span> plans.
          </p>
        </Card>

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
