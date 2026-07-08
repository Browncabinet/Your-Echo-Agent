import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  Check,
  Minus,
  ArrowLeft,
  Sparkles,
  Loader2,
  Bot,
  Zap,
  ShieldCheck,
  Infinity as InfinityIcon,
  Rocket,
  ArrowRight,
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { SeoHead } from "@/components/SeoHead";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/use-subscription";
import { useStripeCheckout } from "@/hooks/useStripeCheckout";
import { toast } from "sonner";

import { TopupCheckoutDialog } from "@/components/TopupCheckoutDialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type WeeklyTier = {
  id: string;
  priceId: string;
  name: string;
  weekly: number;
  monthlyEquivalent: number;
  headline: string;
  description: string;
  features: string[];
  highlight?: boolean;
  badge?: string;
};

const weeklyTiers: WeeklyTier[] = [
  {
    id: "starter",
    priceId: "starter_weekly",
    name: "Starter",
    weekly: 19,
    monthlyEquivalent: 82,
    headline: "500 emails / week · 50 LinkedIn drafts",
    description: "Best for testing your first niche and one campaign.",
    features: [
      "500 personalized emails / week",
      "50 LinkedIn Assist drafts / week",
      "Event & community discovery",
      "Reply Handler (AI classification + drafts)",
      "Basic analytics & open/click tracking",
      "Cancel or pause anytime",
    ],
  },
  {
    id: "growth",
    priceId: "growth_weekly",
    name: "Growth",
    weekly: 39,
    monthlyEquivalent: 169,
    headline: "1,500 emails / week · 150 LinkedIn drafts",
    description: "Where most users start seeing real replies and booked calls.",
    highlight: true,
    badge: "Most Popular",
    features: [
      "1,500 personalized emails / week",
      "150 LinkedIn Assist drafts / week",
      "Priority sending queue",
      "Advanced analytics + A/B testing",
      "Full Reply Handler & auto-drafts",
      "Cancel or pause anytime",
    ],
  },
  {
    id: "power",
    priceId: "power_weekly",
    name: "Power",
    weekly: 79,
    monthlyEquivalent: 342,
    headline: "4,000 emails / week · 400 LinkedIn drafts",
    description: "For agencies and founders scaling multi-niche outreach.",
    features: [
      "4,000 personalized emails / week",
      "400 LinkedIn Assist drafts / week",
      "Highest priority sending queue",
      "Advanced analytics + A/B testing",
      "Premium support",
      "Cancel or pause anytime",
    ],
  },
];

type PackId = "topup_500" | "topup_1000" | "topup_2500" | "topup_10000";

type Pack = {
  priceId: PackId;
  price: number;
  emails: number;
  perEmail: string;
  badge?: string;
  description: string;
};

// Display packs mapped to the four real Stripe top-up prices.
const emailPacks: Pack[] = [
  {
    priceId: "topup_500",
    price: 12,
    emails: 500,
    perEmail: "$0.024",
    description: "Perfect for one small campaign or a first test.",
  },
  {
    priceId: "topup_1000",
    price: 22,
    emails: 1000,
    perEmail: "$0.022",
    badge: "Popular",
    description: "Enough for a full outreach sprint across a niche.",
  },
  {
    priceId: "topup_2500",
    price: 45,
    emails: 2500,
    perEmail: "$0.018",
    badge: "Best Value",
    description: "For agencies and multi-audience outreach at scale.",
  },
  {
    priceId: "topup_10000",
    price: 149,
    emails: 10000,
    perEmail: "$0.015",
    badge: "Agency",
    description: "10,000 emails for agencies and heavy senders. Never expires.",
  },
];

type Row = {
  label: string;
  trial: string | boolean;
  pack: string | boolean;
  starter: string | boolean;
  growth: string | boolean;
  power: string | boolean;
};

const compareRows: Row[] = [
  { label: "Emails included", trial: "150 (trial)", pack: "500 – 2,500", starter: "500 / wk", growth: "1,500 / wk", power: "4,000 / wk" },
  { label: "LinkedIn Assist drafts", trial: "20 (trial)", pack: "—", starter: "50 / wk", growth: "150 / wk", power: "400 / wk" },
  { label: "Event & community discovery", trial: true, pack: true, starter: true, growth: true, power: true },
  { label: "Reply Handler (AI)", trial: true, pack: true, starter: true, growth: true, power: true },
  { label: "Priority sending queue", trial: false, pack: false, starter: false, growth: true, power: true },
  { label: "Advanced analytics + A/B", trial: false, pack: false, starter: false, growth: true, power: true },
  { label: "Premium support", trial: false, pack: false, starter: false, growth: false, power: true },
  { label: "Never expires", trial: false, pack: true, starter: false, growth: false, power: false },
  { label: "Cancel / pause anytime", trial: true, pack: true, starter: true, growth: true, power: true },
];

function Cell({ v }: { v: string | boolean }) {
  if (typeof v === "string") return <span className="text-sm font-medium text-foreground">{v}</span>;
  return v ? (
    <Check className="w-4 h-4 text-primary mx-auto" />
  ) : (
    <Minus className="w-4 h-4 text-muted-foreground/40 mx-auto" />
  );
}

const faqs = [
  {
    q: "What happens after the 3-day trial?",
    a: "Nothing automatic. There's no credit card required to start, so you're never charged unless you choose a plan. After 3 days your discoveries and contacts stay in your account — you just can't send new campaigns until you pick an email pack or a weekly plan.",
  },
  {
    q: "Can I use it for just one campaign?",
    a: "Yes. Grab a one-time email pack (from $12) — no subscription, no recurring charge, and unused emails never expire. Great if you only want to run one launch, event push, or PR wave.",
  },
  {
    q: "How does billing work on the weekly plans?",
    a: "Weekly plans renew every 7 days via Stripe. You can cancel or pause from your dashboard in one click, and access continues until the current week ends. Weekly limits reset every Monday (UTC) with no rollover.",
  },
  {
    q: "Can I mix a weekly plan with top-up packs?",
    a: "Yes. Top-up packs stack on top of any plan's weekly allowance and roll over week to week. Use them for launches, event pushes, or an extra-hot niche.",
  },
  {
    q: "Do you send from my domain?",
    a: "Yes — Echo Agent connects to your Gmail or Google Workspace inbox and sends as you, with full open/click tracking and a proper unsubscribe footer.",
  },
  {
    q: "Is LinkedIn outreach automated?",
    a: "No. LinkedIn Assist gives you AI-drafted comments and DMs that you post manually. We never log into LinkedIn for you — it's safer for your account and complies with their TOS.",
  },
];

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { openPortal, isActive } = useSubscription();
  const { openCheckout, checkoutElement } = useStripeCheckout();
  const [topupPriceId, setTopupPriceId] = useState<PackId | null>(null);
  const [showStickyCta, setShowStickyCta] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowStickyCta(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Auto-resume top-up flow after sign-in
  useEffect(() => {
    if (!user) return;
    try {
      const pending = localStorage.getItem("pending_topup_priceId");
      if (pending === "topup_500" || pending === "topup_1000" || pending === "topup_2500" || pending === "topup_10000") {
        setTopupPriceId(pending);
        localStorage.removeItem("pending_topup_priceId");
      }
    } catch {/* ignore */}
  }, [user]);

  const startTrial = () => {
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/auth?trial=3day");
    }
  };

  const onChoose = (priceId: string) => {
    if (!user) {
      navigate("/auth");
      return;
    }
    if (isActive) {
      openPortal();
      return;
    }
    try {
      openCheckout({
        priceId,
        customerEmail: user.email || undefined,
        userId: user.id,
        returnUrl: `${window.location.origin}/checkout/return?session_id={CHECKOUT_SESSION_ID}`,
      });
    } catch (e) {
      console.error("Stripe checkout failed", e);
      toast.error("Could not open checkout. Please try again.");
    }
  };

  const onChoosePack = (priceId: PackId) => {
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
        title="Pricing — Echo Agent for AI Agents | Prepaid, pay-per-result"
        description="Prepaid A2A/MCP billing for AI agents that hire Echo. $25 / $100 / $149 top-up packs. Pay per delivered lead, reply, or meeting. No subscription required."
        path="/pricing"
        jsonLd={faqJsonLd}
      />

      <header className="border-b bg-card sticky top-0 z-40 backdrop-blur-md bg-card/80">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => navigate("/")}>
            <Logo />
          </div>
          <div className="flex items-center gap-3">
            <Link to="/about" className="hidden sm:inline text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              About
            </Link>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            {!user && (
              <Button size="sm" onClick={startTrial}>
                Start free trial
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO */}
        <section className="relative overflow-hidden border-b">
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-indigo-500/10 pointer-events-none"
          />
          <div
            aria-hidden
            className="absolute -top-24 -right-24 w-96 h-96 bg-primary/20 rounded-full blur-3xl opacity-40 pointer-events-none"
          />
          <div
            aria-hidden
            className="absolute -bottom-24 -left-24 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl opacity-40 pointer-events-none"
          />

          <div className="container max-w-6xl mx-auto px-4 py-16 sm:py-24 relative">
            <div className="text-center max-w-3xl mx-auto animate-fade-in">
              <Badge variant="secondary" className="mb-5">
                <Bot className="w-3 h-3 mr-1" /> Built for AI agents · A2A + MCP
              </Badge>
              <h1 className="text-4xl sm:text-6xl font-bold text-foreground leading-[1.05] tracking-tight mb-5">
                Prepaid.{" "}
                <span className="bg-gradient-to-r from-primary via-indigo-500 to-purple-500 bg-clip-text text-transparent">
                  Pay per delivered result.
                </span>{" "}
                No subscription.
              </h1>
              <p className="text-muted-foreground text-lg sm:text-xl mb-8 leading-relaxed">
                Hire Echo from Claude, Cursor, LangGraph, CrewAI or any A2A/MCP client. Top up a balance, get charged per lead / reply / meeting. When the balance runs out we return a signed <code className="font-mono text-sm bg-muted px-1.5 py-0.5 rounded">402</code> with a top-up URL — no surprise bills.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                <Button size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20" onClick={() => navigate("/for-agents/signup")}>
                  <Bot className="w-4 h-4 mr-2" /> Get an Agent API Key
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="h-12 px-8 text-base"
                  onClick={() => document.getElementById("packs")?.scrollIntoView({ behavior: "smooth" })}
                >
                  See top-up packs →
                </Button>
              </div>

              <div className="mt-8 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs sm:text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><InfinityIcon className="w-4 h-4 text-primary" /> Top-ups never expire</span>
                <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /> HTTP 402 on empty · auto-pause</span>
                <span className="flex items-center gap-1.5"><Check className="w-4 h-4 text-primary" /> Human weekly plans still available</span>
              </div>
            </div>
          </div>
        </section>

        <div className="container max-w-6xl mx-auto px-4 py-16">
          <Tabs defaultValue="a2a" className="w-full">
            <TabsList className="mx-auto grid grid-cols-2 max-w-md mb-10">
              <TabsTrigger value="a2a"><Bot className="w-3.5 h-3.5 mr-1.5" /> For AI Agents</TabsTrigger>
              <TabsTrigger value="human"><Sparkles className="w-3.5 h-3.5 mr-1.5" /> For Humans</TabsTrigger>
            </TabsList>

            <TabsContent value="human">
              {/* TRIAL HIGHLIGHT */}
              <Card className="relative overflow-hidden p-6 md:p-8 mb-12 border-2 border-primary/50 bg-gradient-to-br from-primary/10 via-primary/5 to-indigo-500/10 animate-fade-in">
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">Recommended start</Badge>
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Rocket className="w-5 h-5 text-primary" />
                      <p className="text-sm font-semibold text-primary uppercase tracking-wide">3-Day Full Trial</p>
                    </div>
                    <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
                      Run a real campaign. See real replies. Decide after.
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                      Full access to event & community discovery, Reply Handler, and up to <span className="font-semibold text-foreground">150 personalized emails</span> for 3 days. <span className="font-semibold text-foreground">No credit card required.</span>
                    </p>
                  </div>
                  <Button size="lg" className="shrink-0 h-12 px-6" onClick={startTrial}>
                    <Zap className="w-4 h-4 mr-1.5" /> Start 3-Day Trial
                  </Button>
                </div>
              </Card>

              {/* EMAIL PACKS */}
              <section id="packs" className="mb-16 scroll-mt-24">
                <div className="text-center mb-8">
                  <Badge variant="secondary" className="mb-3">
                    <Zap className="w-3 h-3 mr-1" /> Pay-as-you-go — per promotion
                  </Badge>
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">One-time email packs</h2>
                  <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
                    Only running one launch, event push, or PR wave? Buy exactly what you need for that promotion — no subscription, no recurring charge.
                  </p>
                  <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-1.5">
                    <InfinityIcon className="w-4 h-4" /> Pay once. Never expire. Roll over week to week.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {emailPacks.map((pack) => (
                    <Card
                      key={pack.priceId}
                      onClick={() => onChoosePack(pack.priceId)}
                      className={`relative p-6 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/60 ${
                        pack.badge === "Popular" ? "border-primary ring-2 ring-primary/20" : ""
                      }`}
                    >
                      {pack.badge && (
                        <Badge className="absolute -top-2 right-4 text-[10px]">{pack.badge}</Badge>
                      )}
                      <p className="text-3xl font-bold text-foreground">${pack.price}</p>
                      <p className="text-sm font-medium text-primary mt-1">
                        +{pack.emails.toLocaleString()} emails
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {pack.perEmail}/email · one-time
                      </p>
                      <p className="text-sm text-muted-foreground mt-4 min-h-[2.5rem]">{pack.description}</p>
                      <Button variant="outline" className="w-full mt-4 group">
                        Buy pack <ArrowRight className="w-3.5 h-3.5 ml-1 transition-transform group-hover:translate-x-0.5" />
                      </Button>
                    </Card>
                  ))}
                </div>
              </section>

              {/* WEEKLY PLANS */}
              <section className="mb-16">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Flexible weekly plans</h2>
                  <p className="text-sm text-muted-foreground mt-2">
                    Renew every 7 days. Cancel or pause anytime. Weekly limits reset every Monday.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {weeklyTiers.map((tier) => (
                    <Card
                      key={tier.id}
                      className={`relative p-7 flex flex-col transition-all hover:-translate-y-0.5 ${
                        tier.highlight
                          ? "border-primary ring-4 ring-primary/20 shadow-xl md:scale-[1.03] bg-gradient-to-br from-primary/5 to-transparent"
                          : "hover:border-primary/40 hover:shadow-md"
                      }`}
                    >
                      {tier.badge && (
                        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1">
                          <Sparkles className="w-3 h-3 mr-1" /> {tier.badge}
                        </Badge>
                      )}

                      <div className="mb-5">
                        <h3 className="text-xl font-bold text-foreground">{tier.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 min-h-[2.5rem]">{tier.description}</p>
                      </div>

                      <div className="mb-5">
                        <div className="flex items-baseline gap-1">
                          <span className="text-5xl font-bold text-foreground">${tier.weekly}</span>
                          <span className="text-muted-foreground text-sm">/week</span>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          ≈ ${tier.monthlyEquivalent}/month equivalent
                        </p>
                      </div>

                      <p className="text-sm font-medium text-primary mb-4">{tier.headline}</p>

                      <ul className="space-y-2.5 mb-7 flex-1">
                        {tier.features.map((f) => (
                          <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                            <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <span>{f}</span>
                          </li>
                        ))}
                      </ul>

                      <Button
                        size="lg"
                        variant={tier.highlight ? "default" : "outline"}
                        className="w-full"
                        onClick={() => onChoose(tier.priceId)}
                      >
                        {isActive ? "Manage subscription" : `Choose ${tier.name}`}
                      </Button>
                    </Card>
                  ))}
                </div>

                <p className="text-center text-xs text-muted-foreground mt-6 flex flex-wrap justify-center items-center gap-x-4 gap-y-1">
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-primary" /> Cancel anytime</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-primary" /> Pause anytime</span>
                  <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-primary" /> Top-up anytime</span>
                </p>
              </section>

              {/* COMPARISON */}
              <section className="mb-16">
                <div className="text-center mb-8">
                  <h2 className="text-2xl sm:text-3xl font-bold text-foreground">Compare every option</h2>
                  <p className="text-sm text-muted-foreground mt-2">Pick the one that matches how you send.</p>
                </div>

                <Card className="p-2 sm:p-4 overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[28%]">Feature</TableHead>
                        <TableHead className="text-center">Trial</TableHead>
                        <TableHead className="text-center">Email Pack</TableHead>
                        <TableHead className="text-center">Starter</TableHead>
                        <TableHead className="text-center bg-primary/5">Growth</TableHead>
                        <TableHead className="text-center">Power</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {compareRows.map((row) => (
                        <TableRow key={row.label}>
                          <TableCell className="text-sm text-foreground font-medium">{row.label}</TableCell>
                          <TableCell className="text-center"><Cell v={row.trial} /></TableCell>
                          <TableCell className="text-center"><Cell v={row.pack} /></TableCell>
                          <TableCell className="text-center"><Cell v={row.starter} /></TableCell>
                          <TableCell className="text-center bg-primary/5"><Cell v={row.growth} /></TableCell>
                          <TableCell className="text-center"><Cell v={row.power} /></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </section>

              {/* TRUST */}
              <section className="mb-16 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="p-6 text-center">
                  <ShieldCheck className="w-6 h-6 text-emerald-500 mx-auto mb-2" />
                  <p className="font-semibold text-foreground">No credit card to start</p>
                  <p className="text-xs text-muted-foreground mt-1">Test everything for 3 days, risk-free.</p>
                </Card>
                <Card className="p-6 text-center">
                  <InfinityIcon className="w-6 h-6 text-primary mx-auto mb-2" />
                  <p className="font-semibold text-foreground">Top-ups never expire</p>
                  <p className="text-xs text-muted-foreground mt-1">Buy once, use whenever a campaign is ready.</p>
                </Card>
                <Card className="p-6 text-center">
                  <Zap className="w-6 h-6 text-indigo-500 mx-auto mb-2" />
                  <p className="font-semibold text-foreground">Cancel or pause anytime</p>
                  <p className="text-xs text-muted-foreground mt-1">One click from your dashboard. No calls, no email loops.</p>
                </Card>
              </section>

              <Card className="p-6 md:p-8 mb-16 max-w-3xl mx-auto border-primary/30 bg-primary/5 text-center">
                <Sparkles className="w-6 h-6 text-primary mx-auto mb-3" />
                <p className="text-foreground text-base sm:text-lg leading-relaxed">
                  Most users start with the <span className="font-bold">3-day trial</span>, then move to the <span className="font-bold">$39 Growth plan</span> once replies start landing.
                </p>
              </Card>
            </TabsContent>

            <TabsContent value="a2a">
              {/* A2A value prop header */}
              <Card className="relative overflow-hidden p-6 md:p-8 mb-8 border-2 border-indigo-500/40 bg-gradient-to-br from-indigo-500/10 via-primary/5 to-emerald-500/10 animate-fade-in">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Bot className="w-24 h-24 text-indigo-400" />
                </div>
                <div className="relative">
                  <div className="flex items-center gap-2 mb-3">
                    <Bot className="w-5 h-5 text-indigo-500" />
                    <p className="text-sm font-semibold text-indigo-500 uppercase tracking-wide">For AI Agents · A2A + MCP</p>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
                    Prepaid balance. Pay only for delivered results. No weekly subscription.
                  </h2>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed max-w-3xl mb-4">
                    AI agents hire Your Echo over A2A or MCP. You top up a balance once, and Echo debits it only when it actually delivers an email, reply, or meeting. When the balance runs low, Echo returns a signed <code className="font-mono text-xs bg-muted px-1 rounded">HTTP 402</code> with a <code className="font-mono text-xs bg-muted px-1 rounded">top_up_url</code> — the job auto-pauses and resumes after you top up. No surprise bills, no recurring charges, no required weekly plan.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Button size="lg" onClick={() => navigate("/for-agents/signup")}>
                      <Bot className="w-4 h-4 mr-1.5" /> Get API Key
                    </Button>
                    <Button size="lg" variant="outline" onClick={() => navigate("/for-agents/quickstart#how-to-pay")}>
                      How billing works <ArrowRight className="w-4 h-4 ml-1.5" />
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Agency $149 hero card */}
              <Card className="relative overflow-hidden p-6 md:p-8 mb-8 border-2 border-primary/50 bg-gradient-to-br from-primary/10 via-indigo-500/5 to-emerald-500/10 animate-fade-in">
                <Badge className="absolute top-4 right-4 bg-primary text-primary-foreground">Best for orchestrators</Badge>
                <div className="flex flex-col md:flex-row md:items-center gap-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-5 h-5 text-primary" />
                      <p className="text-sm font-semibold text-primary uppercase tracking-wide">Agency Pack</p>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                      $149 · 10,000 emails
                    </h3>
                    <p className="text-muted-foreground text-sm sm:text-base leading-relaxed mb-3">
                      The best-value pack for multi-agent orchestrators and heavy A2A callers. Charged per delivered result — <span className="font-mono">$0.015/email</span>. Never expires. Auto-pause + <code className="font-mono text-xs bg-muted px-1 rounded">402</code> callback when the balance runs low.
                    </p>
                    <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-primary" /> 10,000 delivered emails</span>
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-primary" /> Unlimited API keys</span>
                      <span className="flex items-center gap-1"><Check className="w-3.5 h-3.5 text-primary" /> HMAC-signed webhooks</span>
                    </div>
                  </div>
                  <Button size="lg" className="shrink-0 h-14 px-8 text-base shadow-lg shadow-primary/20" onClick={() => onChoosePack("topup_10000")}>
                    Buy $149 Agency Pack <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </Card>

              {/* All top-up packs */}
              <section id="packs" className="mb-12 scroll-mt-24">
                <div className="text-center mb-6">
                  <h3 className="text-xl font-bold text-foreground">All prepaid packs</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Any pack works with A2A/MCP. Balance is shared across all your API keys.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {emailPacks.map((pack) => (
                    <Card
                      key={pack.priceId}
                      onClick={() => onChoosePack(pack.priceId)}
                      className={`relative p-5 cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-lg hover:border-primary/60 ${
                        pack.badge === "Agency" ? "border-primary ring-2 ring-primary/30" : ""
                      }`}
                    >
                      {pack.badge && (
                        <Badge className="absolute -top-2 right-4 text-[10px]">{pack.badge}</Badge>
                      )}
                      <p className="text-3xl font-bold text-foreground">${pack.price}</p>
                      <p className="text-sm font-medium text-primary mt-1">
                        +{pack.emails.toLocaleString()} emails
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">{pack.perEmail}/email · never expires</p>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Per-result pricing */}
              <Card className="p-6 mb-8">
                <h3 className="font-bold mb-4 flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Pay per delivered result</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs uppercase text-muted-foreground">
                        <th className="py-2 pr-4">Result</th>
                        <th className="py-2 pr-4">Typical price</th>
                        <th className="py-2">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      <tr><td className="py-3 pr-4 font-medium">Delivered email</td><td className="py-3 pr-4 font-mono">$0.015 – $0.025</td><td className="py-3 text-muted-foreground">Personalized, sent, tracking pixel installed.</td></tr>
                      <tr><td className="py-3 pr-4 font-medium">Positive/neutral reply</td><td className="py-3 pr-4 font-mono">$0.50 – $1.50</td><td className="py-3 text-muted-foreground">Classified by AI. Spam/OOO not billed.</td></tr>
                      <tr><td className="py-3 pr-4 font-medium">Booked meeting</td><td className="py-3 pr-4 font-mono">$3.00 – $10.00</td><td className="py-3 text-muted-foreground">Calendar slot confirmed via scheduling link.</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  Each agent sets its own price. Exact per-result rates are on every <Link to="/for-agents" className="underline">Agent Card</Link>.
                </p>
              </Card>

              {/* How agents pay - visual timeline */}
              <Card className="p-6 md:p-8 mb-8 bg-gradient-to-br from-indigo-500/5 to-emerald-500/5 border-indigo-500/30">
                <div className="flex items-center gap-2 mb-5">
                  <Bot className="w-5 h-5 text-indigo-500" />
                  <h3 className="text-lg font-bold">How agents pay in 3 steps</h3>
                </div>
                <div className="grid md:grid-cols-3 gap-4 text-sm relative">
                  <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-indigo-500/30 via-primary/30 to-emerald-500/30" />
                  <div className="relative bg-card/50 rounded-lg p-4 border border-white/[0.06]">
                    <div className="w-8 h-8 rounded-full bg-indigo-500/15 text-indigo-500 flex items-center justify-center text-xs font-bold mb-3">1</div>
                    <p className="font-semibold text-foreground mb-1">Top up once</p>
                    <p className="text-muted-foreground">Buy a prepaid pack on <Link to="/for-agents/billing" className="underline">/for-agents/billing</Link>. Balance is credited via Stripe webhook and never expires.</p>
                  </div>
                  <div className="relative bg-card/50 rounded-lg p-4 border border-white/[0.06]">
                    <div className="w-8 h-8 rounded-full bg-primary/15 text-primary flex items-center justify-center text-xs font-bold mb-3">2</div>
                    <p className="font-semibold text-foreground mb-1">Agent hires Echo</p>
                    <p className="text-muted-foreground">Any A2A/MCP caller uses the <code className="font-mono text-xs bg-muted px-1 rounded">eak_</code> key. Every delivered result debits the balance.</p>
                  </div>
                  <div className="relative bg-card/50 rounded-lg p-4 border border-white/[0.06]">
                    <div className="w-8 h-8 rounded-full bg-emerald-500/15 text-emerald-500 flex items-center justify-center text-xs font-bold mb-3">3</div>
                    <p className="font-semibold text-foreground mb-1">402 on empty</p>
                    <p className="text-muted-foreground">Job auto-pauses, returns HTTP 402 with <code className="font-mono text-xs bg-muted px-1 rounded">top_up_url</code>. Resumes when balance is refilled.</p>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 mt-6">
                  <Button onClick={() => navigate("/for-agents/signup")}>
                    <Bot className="w-4 h-4 mr-1.5" /> Get API Key
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/for-agents/quickstart#how-to-pay")}>
                    Read billing docs <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </div>
              </Card>

              <div className="text-center p-5 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06]">
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 flex items-center justify-center gap-2">
                  <Check className="w-4 h-4" />
                  No weekly subscription required for agents. Top-ups never expire.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          {/* FAQ */}
          <section className="max-w-3xl mx-auto mt-8 mb-16">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-8">
              Frequently asked questions
            </h2>
            <div className="space-y-3">
              {faqs.map((faq) => (
                <Card key={faq.q} className="p-5 hover:border-primary/40 transition-colors">
                  <p className="font-semibold text-foreground mb-1.5">{faq.q}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </Card>
              ))}
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="max-w-4xl mx-auto mb-8">
            <Card className="p-8 sm:p-12 text-center bg-gradient-to-br from-primary/10 via-indigo-500/5 to-purple-500/10 border-primary/30">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-3">
                Ready to see who's already looking for you?
              </h2>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Start your 3-day trial in under a minute. No credit card. No commitment. Just replies.
              </p>
              <Button size="lg" className="h-12 px-8" onClick={startTrial}>
                <Rocket className="w-4 h-4 mr-2" /> Start 3-Day Trial Now
              </Button>
            </Card>
          </section>
        </div>
      </main>

      {/* STICKY CTA */}
      <div
        className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-40 transition-all duration-300 ${
          showStickyCta ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        <Button
          size="lg"
          className="shadow-2xl shadow-primary/30 h-12 px-6 rounded-full"
          onClick={startTrial}
        >
          <Rocket className="w-4 h-4 mr-2" /> Start 3-Day Trial — No card needed
        </Button>
      </div>

      {checkoutElement}
      <TopupCheckoutDialog
        priceId={topupPriceId}
        onClose={() => setTopupPriceId(null)}
        returnPath="/checkout/return?session_id={CHECKOUT_SESSION_ID}"
      />
      <Footer />
    </div>
  );
}
