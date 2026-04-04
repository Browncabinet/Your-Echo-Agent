import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowLeft, Coins, Sparkles } from "lucide-react";
import { Logo } from "@/components/Logo";

const creditPacks = [
  {
    credits: 600,
    price: "$10",
    perEmail: "$0.017",
    label: "Starter",
    description: "Send up to 600 emails",
    popular: true,
    badge: "Popular",
  },
  {
    credits: 1800,
    price: "$25",
    perEmail: "$0.014",
    label: "Growth",
    description: "Send up to 1,800 emails",
    popular: false,
    badge: "Best Value",
  },
  {
    credits: 4000,
    price: "$50",
    perEmail: "$0.013",
    label: "Scale",
    description: "Send up to 4,000 emails",
    popular: false,
    badge: null,
  },
  {
    credits: 9000,
    price: "$100",
    perEmail: "$0.011",
    label: "Pro",
    description: "Send up to 9,000 emails",
    popular: false,
    badge: null,
  },
];

const included = [
  "50 free emails on signup",
  "AI-powered email writing",
  "Lead research & personalization",
  "Open & click tracking",
  "Reply handling with AI drafts",
  "No monthly commitment",
];

const faqs = [
  {
    q: "Why is Your Echo Agent so affordable?",
    a: "We believe great marketing tools shouldn't cost a fortune. We keep costs low by focusing on what matters — lead generation and outreach — without the bloated feature sets that drive up prices elsewhere.",
  },
  {
    q: "Do my emails expire?",
    a: "No. Your email balance never expires. Use them whenever you're ready.",
  },
  {
    q: "Can I buy more emails anytime?",
    a: "Absolutely. Purchase additional email packs whenever you need them — no subscriptions, no lock-in.",
  },
  {
    q: "Is there a free tier?",
    a: "Yes! Every new account gets 50 free credits to try out the platform. No credit card required.",
  },
];

export default function Pricing() {
  const navigate = useNavigate();

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

      <main className="container max-w-5xl mx-auto px-4 py-12">
        {/* Hero */}
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            Pay as you go
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Simple, Honest Pricing
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            No subscriptions. No contracts. Buy credits when you need them and send personalized outreach at a fraction of the cost.
          </p>
        </div>

        {/* Credit Packs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {creditPacks.map((pack) => (
            <Card
              key={pack.credits}
              className={`p-6 flex flex-col relative text-center ${
                pack.popular
                  ? "border-primary ring-2 ring-primary/20 shadow-lg"
                  : ""
              }`}
            >
              {pack.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  {pack.badge}
                </Badge>
              )}

              <div className="mb-4 mt-2">
                <Sparkles className="w-6 h-6 text-primary mx-auto mb-2" />
                <p className="text-3xl font-bold text-foreground">{pack.credits.toLocaleString()}</p>
                <p className="text-sm text-muted-foreground">credits</p>
              </div>

              <div className="mb-4">
                <span className="text-4xl font-bold text-foreground">{pack.price}</span>
                <span className="text-muted-foreground text-sm ml-1">one-time</span>
              </div>

              <p className="text-xs font-medium text-primary mb-1">{pack.label}</p>
              <p className="text-sm text-muted-foreground mb-2">{pack.description}</p>
              <p className="text-xs text-muted-foreground mb-6">{pack.perEmail} per email</p>

              <Button
                className="w-full mt-auto"
                variant={pack.popular ? "default" : "outline"}
                onClick={() => navigate("/auth")}
              >
                Get Started
              </Button>
            </Card>
          ))}
        </div>

        {/* What's Included */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground text-center mb-6">
            Everything Included
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
            {included.map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="w-4 h-4 text-primary shrink-0" />
                {item}
              </div>
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
