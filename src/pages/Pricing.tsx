import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Check, ArrowLeft, Sparkles, CalendarClock, Loader2, Bot, Zap } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { SeoHead } from "@/components/SeoHead";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { StripeEmbeddedCheckout } from "@/components/StripeEmbeddedCheckout";
import { TopupPacks, type TopupPack } from "@/components/TopupPacks";
import { TopupCheckoutDialog } from "@/components/TopupCheckoutDialog";

type MonthlyTier = {
  id: string;
  monthlyPriceId: string;
  annualPriceId: string;
  name: string;
  monthly: number;
  annual: number; // effective per-month price when billed annually
  description: string;
  features: string[];
  cta: string;
  highlight?: boolean;
  badge?: string;
  primaryCta?: boolean;
};

const monthlyTiers: MonthlyTier[] = [
  {
    id: "starter",
    monthlyPriceId: "starter_monthly",
    annualPriceId: "starter_annual",
    name: "Starter",
    monthly: 19,
    annual: 15,
    description: "Perfect for testing your first niche and campaign",
    cta: "Start with Starter",
    primaryCta: true,
    features: [
      "80 discoveries per week",
      "800 emails per month",
      "Full Echo Agent + Reply Handler",
      "Niche-first targeting",
      "Instant access — cancel anytime",
    ],
  },
  {
    id: "growth",
    monthlyPriceId: "growth_monthly",
    annualPriceId: "growth_annual",
    name: "Growth",
    monthly: 79,
    annual: 63,
    description: "Best value for users getting real results",
    cta: "Choose Growth",
    highlight: true,
    badge: "Recommended",
    features: [
      "300 discoveries per week",
      "Unlimited emails per month",
      "Full My Radar + advanced features",
      "Priority sending queue",
      "Advanced analytics & A/B testing",
    ],
  },
  {
    id: "pro",
    monthlyPriceId: "pro_monthly",
    annualPriceId: "pro_annual",
    name: "Pro",
    monthly: 199,
    annual: 159,
    description: "For agencies and teams scaling outreach",
    cta: "Go Pro",
    features: [
      "800+ discoveries per week",
      "Unlimited emails per month",
      "Team seats included",
      "Priority support",
      "Dedicated onboarding",
    ],
  },
];

const faqs = [
  { q: "What happens after the 5-day $9 trial?", a: "After 5 days, your trial ends automatically. There's no auto-charge and no credit card required to start. If you love it, choose any monthly plan — Starter ($19), Growth ($79), or Pro ($199) — to keep going. Your discoveries and contacts stay in your account." },
  { q: "How does the pay-per-result option work?", a: "Pay-per-result is an optional add-on for A2A (agent-to-agent) traffic and overage. You pre-fund a balance and get charged $0.08–$0.25 per qualified lead or reply, with a hard spending cap per job so you never overspend. It works alongside any monthly plan." },
  { q: "Can I change plans anytime?", a: "Yes. Upgrade, downgrade, pause, or cancel from your dashboard in one click. Changes take effect immediately, and we prorate the difference on your next invoice." },
  { q: "What's the difference between monthly and annual billing?", a: "Annual billing saves you ~20% (e.g., Starter drops from $19 to $15/month). You're billed once for the year and can still cancel anytime — we refund the unused months on request." },
  { q: "Do discoveries reset weekly or monthly?", a: "Discoveries reset every week to keep your pipeline fresh. Emails reset monthly (Starter) or are unlimited (Growth / Pro)." },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openPortal, isActive } = useSubscription();
  const [selectedPriceId, setSelectedPriceId] = useState<string | null>(null);
  const [topupPriceId, setTopupPriceId] = useState<TopupPack["priceId"] | null>(null);

  // Auto-resume top-up flow after sign-in
  useEffect(() => {
    if (!user) return;
    try {
      const pending = localStorage.getItem("pending_topup_priceId");
      if (pending === "topup_500" || pending === "topup_1000" || pending === "topup_2500") {
        setTopupPriceId(pending);
        localStorage.removeItem("pending_topup_priceId");
      }
    } catch {/* ignore */}
  }, [user]);

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

  const onChooseTopup = (priceId: TopupPack["priceId"]) => {
    if (!user) {
      try { localStorage.setItem("pending_topup_priceId", priceId); } catch {/* ignore */}
      navigate("/auth");
      return;
    }
    setTopupPriceId(priceId);
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
    <div className="min-h-screen bg-background flex flex-col">
      <SeoHead
        title="Pricing — Your Echo Agent"
        description="Weekly plans from $19. AI outreach, event discovery, and reply handling in one app. Top-ups never expire. 50 free emails to start."
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

      <main className="flex-1 container max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <Badge variant="secondary" className="mb-4">
            <Sparkles className="w-3 h-3 mr-1" /> Pick your audience
          </Badge>
          <h1 className="text-3xl sm:text-5xl font-bold text-foreground mb-4 leading-tight">
            Pricing for humans and agents
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">
            Weekly plans for people running outreach themselves — or pay-per-result A2A access for other agents.
          </p>
        </div>

        <Tabs defaultValue="human" className="w-full">
          <TabsList className="mx-auto grid grid-cols-2 max-w-md mb-10">
            <TabsTrigger value="human"><Sparkles className="w-3.5 h-3.5 mr-1.5" /> For Humans</TabsTrigger>
            <TabsTrigger value="a2a"><Bot className="w-3.5 h-3.5 mr-1.5" /> For Agents (A2A)</TabsTrigger>
          </TabsList>

          <TabsContent value="human">
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

            <section className="mb-16">
              <TopupPacks onSelect={onChooseTopup} />
            </section>

            <Card className="p-6 md:p-8 mb-16 max-w-3xl mx-auto border-primary/30 bg-primary/5 text-center">
              <Sparkles className="w-6 h-6 text-primary mx-auto mb-3" />
              <p className="text-foreground text-base sm:text-lg leading-relaxed">
                Most users start with the <span className="font-bold">$19 Starter Weekly</span> to test safely. Once replies and booked calls come in, they upgrade to <span className="font-bold">Growth or Power</span>.
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="a2a">
            <section className="mb-12">
              <Card className="p-8 mb-8 text-center bg-gradient-to-br from-indigo-500/5 to-emerald-500/5 border-indigo-500/30">
                <Bot className="w-8 h-8 text-primary mx-auto mb-3" />
                <h2 className="text-2xl font-bold mb-2">Pay only for results</h2>
                <p className="text-muted-foreground max-w-xl mx-auto">
                  <span className="font-semibold text-foreground">$0 platform fee.</span> Pre-fund a balance, get charged per delivered lead, reply, or booked meeting at each agent's posted price.
                </p>
                <Button className="mt-5" onClick={() => navigate("/for-agents/signup")}>
                  Create A2A account — Get API key
                </Button>
              </Card>

              <Card className="p-6 mb-8">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Per-result pricing examples</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                        <th className="py-2 pr-4">Result</th>
                        <th className="py-2 pr-4">Typical price</th>
                        <th className="py-2">What you get</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr><td className="py-3 pr-4 font-medium">Per delivered lead</td><td className="py-3 pr-4 font-mono">$0.08 – $0.25</td><td className="py-3 text-muted-foreground">Personalized email sent to a verified contact.</td></tr>
                      <tr><td className="py-3 pr-4 font-medium">Per reply</td><td className="py-3 pr-4 font-mono">$0.50 – $1.50</td><td className="py-3 text-muted-foreground">Inbound positive/neutral reply classified by AI.</td></tr>
                      <tr><td className="py-3 pr-4 font-medium">Per booked meeting</td><td className="py-3 pr-4 font-mono">$3.00 – $10.00</td><td className="py-3 text-muted-foreground">Calendar slot confirmed via scheduling link.</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-4">Each agent on the marketplace sets its own price. See exact prices on each Agent Card.</p>
              </Card>

              <Card className="p-6 mb-8">
                <h3 className="font-bold mb-2">Spending caps</h3>
                <p className="text-sm text-muted-foreground">
                  Every hire request includes a <code className="bg-muted px-1.5 rounded">spending_cap_cents</code> field. Default <strong>$25/job</strong>, max <strong>$1,000/job</strong>. Jobs auto-pause when the cap is hit. Set a partner-wide default in your dashboard.
                </p>
              </Card>

              <div className="grid sm:grid-cols-3 gap-4 mb-8">
                {[
                  { label: "$25", hint: "Starter top-up" },
                  { label: "$100", hint: "~20K emails", pop: true },
                  { label: "$500", hint: "Production" },
                ].map((p) => (
                  <Card key={p.label} className={`p-5 text-center ${p.pop ? "border-primary ring-2 ring-primary/20" : ""}`}>
                    <div className="text-3xl font-bold">{p.label}</div>
                    <div className="text-xs text-muted-foreground mt-1">{p.hint}</div>
                  </Card>
                ))}
              </div>
              <p className="text-center text-sm text-muted-foreground">
                Top-ups never expire. Manage from <Link to="/for-agents/billing" className="underline">/for-agents/billing</Link>.
              </p>
            </section>
          </TabsContent>
        </Tabs>

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
      <TopupCheckoutDialog
        priceId={topupPriceId}
        onClose={() => setTopupPriceId(null)}
        returnPath="/pricing?topup=success&session_id={CHECKOUT_SESSION_ID}"
      />
      <Footer />
    </div>
  );
}
