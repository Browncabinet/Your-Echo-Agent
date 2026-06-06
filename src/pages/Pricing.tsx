import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Check, ArrowLeft, Sparkles, CalendarClock } from "lucide-react";
import { Logo } from "@/components/Logo";

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
    price: 9,
    messages: "600–700 LinkedIn messages",
    description: "Perfect for testing and trying your first campaign",
    features: [
      "600–700 messages / week",
      "1 Echo Agent",
      "Niche targeting",
      "Basic reply handling",
      "Cancel or pause anytime",
    ],
  },
  {
    id: "growth_weekly",
    name: "Growth Weekly",
    price: 19,
    messages: "1,800–2,000 messages per week",
    description: "Best value for most users getting real results",
    features: [
      "1,800–2,000 messages / week",
      "1 Echo Agent",
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
    price: 39,
    messages: "4,000+ messages per week",
    description: "For power users and agencies scaling fast",
    features: [
      "4,000+ messages / week",
      "Full A2A API access",
      "Priority hosting",
      "White-label branding",
      "Cancel or pause anytime",
    ],
  },
];

const faqs = [
  {
    q: "Can I cancel or pause anytime?",
    a: "Yes — all weekly plans renew every 7 days. Pause, cancel, or switch tiers any time from your dashboard. No questions asked.",
  },
  {
    q: "Should I start with Starter or Growth?",
    a: "Most users begin with Starter Weekly to test safely in their niche. Once replies and booked calls start coming in, they upgrade to Growth or Power for more volume.",
  },
  {
    q: "Is there a monthly or annual discount?",
    a: "Weekly pricing keeps things flexible. If you stay on a plan for a full month, it works out to roughly the same as a monthly plan — but you keep the freedom to pause anytime.",
  },
  {
    q: "What happens if I upgrade mid-week?",
    a: "Your new plan starts immediately and you're billed the prorated difference. No wasted days.",
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const [showSavings, setShowSavings] = useState(false);

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
            <Sparkles className="w-3 h-3 mr-1" /> Start Small and Grow as You Go
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
            Start Small and Grow as You Go
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            Flexible weekly packages. Cancel or pause anytime. No long-term commitments.
          </p>
        </div>

        {/* Weekly Plans */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-primary text-primary-foreground">
              <CalendarClock className="w-3 h-3 mr-1" /> Weekly Plans
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-2">
              Weekly Plans
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Pick a plan that fits your stage. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {weeklyTiers.map((tier) => (
              <Card
                key={tier.id}
                className={`p-8 flex flex-col relative transition-all ${
                  tier.highlight
                    ? "border-primary ring-4 ring-primary/20 shadow-xl md:scale-105 bg-gradient-to-br from-primary/5 to-transparent"
                    : "hover:border-primary/40 hover:shadow-md"
                }`}
              >
                {/* Cancel badge on every plan */}
                <Badge
                  variant="secondary"
                  className="absolute -top-3 right-4 border-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                >
                  Cancel or change anytime
                </Badge>

                {tier.badge && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1">
                    <Sparkles className="w-3 h-3 mr-1" /> {tier.badge}
                  </Badge>
                )}

                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-foreground mb-1">{tier.name}</h3>
                  <p className="text-sm text-muted-foreground">{tier.description}</p>
                  <div className="mt-4">
                    <p className="text-5xl sm:text-6xl font-bold text-foreground">${tier.price}</p>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">per week</p>
                  </div>
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  <li className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                    <span className="font-medium">{tier.messages}</span>
                  </li>
                  {tier.features.slice(1).map((f) => (
                    <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  size="lg"
                  variant={tier.highlight ? "default" : "outline"}
                  className="w-full"
                  onClick={() => navigate("/auth")}
                >
                  Start {tier.name}
                </Button>
              </Card>
            ))}
          </div>
        </section>

        {/* Monthly / Annual equivalent toggle */}
        <div className="flex flex-col items-center justify-center gap-3 mb-16">
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
            <div className="text-center mt-2">
              <p className="text-sm text-muted-foreground">
                Stay on a weekly plan for a full month and it works out to roughly:
              </p>
              <div className="flex flex-wrap justify-center gap-4 mt-3">
                <Badge variant="outline">Starter ≈ $36/mo</Badge>
                <Badge variant="outline">Growth ≈ $76/mo</Badge>
                <Badge variant="outline">Power ≈ $156/mo</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                But you keep the flexibility to pause or cancel any week — no annual contract needed.
              </p>
            </div>
          )}
        </div>

        {/* Important note */}
        <Card className="p-6 md:p-8 mb-16 max-w-3xl mx-auto border-primary/30 bg-primary/5 text-center">
          <Sparkles className="w-6 h-6 text-primary mx-auto mb-3" />
          <p className="text-foreground text-base sm:text-lg leading-relaxed">
            Most users start with the <span className="font-bold">$9 Starter Weekly</span> to test safely. Once they begin seeing replies, booked calls, and revenue, they upgrade to <span className="font-bold">Growth or Power</span>.
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
