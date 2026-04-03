import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Zap, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "/mo",
    description: "Get started with the basics",
    badge: "Start Here",
    badgeVariant: "outline" as const,
    contacts: "50 contacts",
    features: [
      "1 campaign",
      "Basic email templates",
      "Manual social posts",
      "Community support",
    ],
    cta: "Get Started Free",
    highlighted: false,
  },
  {
    name: "Starter",
    price: "$9",
    period: "/mo",
    description: "Perfect for solo founders",
    badge: "Most Popular",
    badgeVariant: "default" as const,
    contacts: "200 contacts",
    features: [
      "3 campaigns",
      "AI email writing",
      "A/B testing",
      "Auto lead search",
      "Email support",
    ],
    cta: "Start for $9/mo",
    highlighted: true,
  },
  {
    name: "Growth",
    price: "$19",
    period: "/mo",
    description: "Scale your outreach",
    badge: null,
    badgeVariant: "outline" as const,
    contacts: "500 contacts",
    features: [
      "Unlimited campaigns",
      "Priority scraping",
      "Analytics dashboard",
      "Social media content",
      "Priority support",
    ],
    cta: "Start for $19/mo",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$39",
    period: "/mo",
    description: "For power users & agencies",
    badge: null,
    badgeVariant: "outline" as const,
    contacts: "2,000 contacts",
    features: [
      "Everything in Growth",
      "API access",
      "CRM integration (HubSpot, Salesforce, Google Sheets)",
      "Custom branding",
      "Dedicated support",
    ],
    cta: "Start for $39/mo",
    highlighted: false,
  },
];

const addons = [
  { name: "Extra 100 contacts", price: "$3", period: "one-time" },
  { name: "Extra 500 contacts", price: "$10", period: "one-time" },
  { name: "AI Social Media Content", price: "$5", period: "/mo" },
  { name: "Advanced Analytics", price: "$5", period: "/mo" },
];

const faqs = [
  {
    q: "Why is Your Echo Agent so affordable?",
    a: "We believe great marketing tools shouldn't cost a fortune. We keep costs low by focusing on what matters — lead generation and outreach — without the bloated feature sets that drive up prices elsewhere.",
  },
  {
    q: "Can I upgrade or downgrade anytime?",
    a: "Absolutely. Change your plan or cancel whenever you want. No contracts, no lock-in.",
  },
  {
    q: "What happens if I hit my contact limit?",
    a: "You can purchase add-on contact packs at any time — starting at just $3 for 100 extra contacts.",
  },
  {
    q: "Is there a free trial for paid plans?",
    a: "Every plan starts with a free tier so you can try the product before upgrading. No credit card required.",
  },
];

export default function Pricing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => navigate("/")}
          >
            <Zap className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Your Echo Agent</h1>
          </div>
          <div className="flex items-center gap-2">
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
            The affordable alternative
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-3">
            Simple, Honest Pricing
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Stop overpaying for marketing tools. Get leads, write emails, and grow your business — starting free.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {plans.map((plan) => (
            <Card
              key={plan.name}
              className={`p-6 flex flex-col relative ${
                plan.highlighted
                  ? "border-primary ring-2 ring-primary/20 shadow-lg"
                  : ""
              }`}
            >
              {plan.badge && (
                <Badge
                  variant={plan.badgeVariant}
                  className={`absolute -top-3 left-1/2 -translate-x-1/2 ${
                    plan.highlighted ? "bg-primary text-primary-foreground" : ""
                  }`}
                >
                  {plan.badge}
                </Badge>
              )}

              <div className="mb-4 mt-2">
                <h3 className="text-lg font-semibold text-foreground">{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>

              <div className="mb-4">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground text-sm">{plan.period}</span>
              </div>

              <p className="text-sm font-medium text-foreground mb-4">
                {plan.contacts}
              </p>

              <ul className="space-y-2 mb-6 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <Button
                className="w-full"
                variant={plan.highlighted ? "default" : "outline"}
                onClick={() => navigate("/auth")}
              >
                {plan.cta}
              </Button>
            </Card>
          ))}
        </div>

        {/* Add-ons */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-foreground text-center mb-6">
            Need More? Add What You Need
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {addons.map((addon) => (
              <Card key={addon.name} className="p-4 text-center">
                <p className="font-medium text-foreground text-sm">{addon.name}</p>
                <p className="text-2xl font-bold text-primary mt-1">{addon.price}</p>
                <p className="text-xs text-muted-foreground">{addon.period}</p>
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
