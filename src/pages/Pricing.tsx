import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, ArrowLeft, Sparkles, CalendarClock, Loader2 } from "lucide-react";
import { Logo } from "@/components/Logo";
import { SeoHead } from "@/components/SeoHead";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";

type WeeklyTier = {
  id: string;
  name: string;
  price: number;
  emails: number;
  linkedin: number;
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
    emails: 500,
    linkedin: 50,
    description: "Perfect for testing and your first campaign",
    features: [
      "500 emails / week",
      "50 LinkedIn Assist actions / week",
      "Full Echo Agent + Reply Handler",
      "Niche-first targeting",
      "Cancel or pause anytime",
    ],
  },
  {
    id: "growth_weekly",
    name: "Growth Weekly",
    price: 39,
    emails: 1500,
    linkedin: 150,
    description: "Best value for most users getting real results",
    features: [
      "1,500 emails / week",
      "150 LinkedIn Assist actions / week",
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
    emails: 4000,
    linkedin: 400,
    description: "For power users and agencies scaling fast",
    features: [
      "4,000 emails / week",
      "400 LinkedIn Assist actions / week",
      "Full Echo Agent + Reply Handler",
      "Priority sending queue",
      "Cancel or pause anytime",
    ],
  },
];

const faqs = [
  { q: "Can I cancel or change tiers anytime?", a: "Yes. All weekly plans renew every 7 days. Cancel, pause, or switch from your dashboard — access continues until the current week ends." },
  { q: "What counts as a LinkedIn Assist action?", a: "Each AI generation that returns group suggestions plus comment/DM drafts counts as one action. You then post or message manually from LinkedIn." },
  { q: "Does my email allowance roll over?", a: "No — every weekly plan resets every Monday so you always get a fresh quota. This keeps deliverability healthy." },
  { q: "What happens if I hit my weekly cap?", a: "Sending pauses until the week resets, or you can upgrade instantly to keep going." },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openPortal, isActive } = useSubscription();
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);

  const onChoose = (priceId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (isActive) {
      openPortal();
      return;
    }
    setSelectedPriceId(priceId);
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title="Pricing — Weekly Plans from $19 · Your Echo Agent"
        description="Simple weekly plans: Starter $19, Growth $39, Power $79. Cold email + LinkedIn outreach in one place. Cancel or pause anytime."
        path="/pricing"
        jsonLd={faqJsonLd}
      />
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
            {!user && (
              <Button size="sm" onClick={() => navigate("/auth")}>
                Sign In
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" /> Start Small, Grow As You Go
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
            Simple Weekly Plans
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            Email + LinkedIn outreach in one place. Resets every week. Cancel anytime.
          </p>
        </div>

        <section className="mb-16">
          <div className="text-center mb-8">
            <Badge className="mb-3 bg-primary text-primary-foreground">
              <CalendarClock className="w-3 h-3 mr-1" /> Weekly Plans
            </Badge>
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
                  {tier.features.map((f) => (
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
                  onClick={() => onChoose(tier.id)}
                >
                  {isActive ? "Manage subscription" : `Start ${tier.name}`}
                </Button>
              </Card>
            ))}
          </div>
        </section>

        <Card className="p-6 md:p-8 mb-16 max-w-3xl mx-auto border-primary/30 bg-primary/5 text-center">
          <Sparkles className="w-6 h-6 text-primary mx-auto mb-3" />
          <p className="text-foreground text-base sm:text-lg leading-relaxed">
            Most users start with the <span className="font-bold">$19 Starter Weekly</span> to test safely. Once replies and booked calls come in, they upgrade to <span className="font-bold">Growth or Power</span>.
          </p>
        </Card>

        <div className="max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-foreground text-center mb-6">Frequently Asked Questions</h3>
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

      <Dialog open={!!selectedPriceId} onOpenChange={(o) => { if (!o) setSelectedPriceId(null); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Start your weekly plan</DialogTitle>
            <DialogDescription>Secure checkout — cancel anytime from your dashboard.</DialogDescription>
          </DialogHeader>
          {selectedPriceId && user && (
            <StripeEmbeddedCheckout
              priceId={selectedPriceId}
              customerEmail={user.email || undefined}
              userId={user.id}
              returnUrl={`${window.location.origin}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`}
            />
          )}
          {!selectedPriceId && <Loader2 className="w-6 h-6 animate-spin mx-auto my-8 text-primary" />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
