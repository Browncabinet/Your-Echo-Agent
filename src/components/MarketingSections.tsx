import React from "react";
import { Card } from "@/components/ui/card";
import { Globe, Linkedin, MessageSquareReply, TrendingUp, BarChart3, Zap, Users, Target } from "lucide-react";

const comparisonRows = [
  { feature: "Paste URL → Campaign", us: "✅ Zero-form Quick Start + Guided mode", a: "✅ Very fast drafts", b: "— List upload required", c: "— Manual setup" },
  { feature: "AI Research & Personalization", us: "✅ Reads your site + target sites", a: "✅ Strong deep research", b: "⚠️ Template + basic AI", c: "✅ Large database + signals" },
  { feature: "Sending Emails", us: "✅ Built-in sending", a: "✅ Drafts only (sending separate)", b: "✅ Strong sending", c: "✅ Good sending" },
  { feature: "Reply Handling", us: "✅ AI classifies + drafts replies", a: "— Limited / not included", b: "⚠️ Basic sequences", c: "⚠️ Basic" },
  { feature: "Open & Click Tracking", us: "✅ Real-time + AI insights", a: "✅ Basic", b: "✅ Excellent", c: "✅ Excellent" },
  { feature: "Pricing Model", us: "🟢 Flexible – pay as you grow", a: "💰 Monthly subscription", b: "💰 $30–$300+/mo", c: "💰 $49+/mo+" },
  { feature: "Best For", us: "Solo builders & multiple small projects", a: "Teams wanting fast AI drafts", b: "High-volume sending teams", c: "Large sales teams" },
];

const mobileComparisonRows = [
  { feature: "Paste URL → Campaign", us: "✅ Zero-form Quick Start + Guided mode", others: "AutoGTM: ✅ Fast drafts · Instantly: — List upload · Apollo: — Manual" },
  { feature: "AI Research & Personalization", us: "✅ Reads your site + target sites", others: "AutoGTM: ✅ Deep research · Instantly: ⚠️ Basic AI · Apollo: ✅ Large DB" },
  { feature: "Sending Emails", us: "✅ Built-in sending", others: "AutoGTM: ✅ Drafts only (sending separate) · Instantly: ✅ Strong · Apollo: ✅ Good" },
  { feature: "Reply Handling", us: "✅ AI classifies + drafts replies", others: "AutoGTM: — Limited / not included · Instantly: ⚠️ Basic · Apollo: ⚠️ Basic" },
  { feature: "Open & Click Tracking", us: "✅ Real-time + AI insights", others: "AutoGTM: ✅ Basic · Instantly: ✅ Excellent · Apollo: ✅ Excellent" },
  { feature: "Pricing Model", us: "🟢 Flexible – pay as you grow", others: "AutoGTM: 💰 Monthly · Instantly: 💰 $30–$300+/mo · Apollo: 💰 $49+/mo" },
  { feature: "Best For", us: "Solo builders & multiple small projects", others: "AutoGTM: AI-first teams · Instantly: High-volume · Apollo: Large sales teams" },
];

export const FeaturesSection = React.forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="mb-14">
      <h3 className="text-center text-lg font-semibold text-foreground mb-6">
        How Your Echo Agent Works
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 text-center">
          <div className="mx-auto w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
            <Globe className="w-5 h-5 text-primary" />
          </div>
          <h4 className="font-semibold text-sm text-foreground mb-1">Paste Your URL</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your agent learns your voice, brand, and goals in seconds — no manual setup required.
          </p>
        </Card>
        <Card className="p-5 text-center">
          <div className="mx-auto w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
            <Linkedin className="w-5 h-5 text-primary" />
          </div>
          <h4 className="font-semibold text-sm text-foreground mb-1">Find Warm Leads on LinkedIn</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Intent-based targeting surfaces prospects by recent activity, job changes, and funding — automatically.
          </p>
        </Card>
        <Card className="p-5 text-center">
          <div className="mx-auto w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
            <MessageSquareReply className="w-5 h-5 text-primary" />
          </div>
          <h4 className="font-semibold text-sm text-foreground mb-1">Messages That Sound Like You</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Personalized connection requests and follow-ups crafted from your voice — not generic sales templates.
          </p>
        </Card>
        <Card className="p-5 text-center">
          <div className="mx-auto w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h4 className="font-semibold text-sm text-foreground mb-1">Replies, Meetings & Revenue</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            AI handles replies, books calls into your calendar, and tracks real revenue — not just "sent" counts.
          </p>
        </Card>
      </div>
    </div>
  );
});
FeaturesSection.displayName = "FeaturesSection";

export const ComparisonSection = React.forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="pt-4 mb-14">
      <h3 className="text-center text-lg font-semibold text-foreground mb-2">
        Built Differently
      </h3>
      <p className="text-center text-sm text-muted-foreground mb-6 max-w-2xl mx-auto">
        We built Your Echo Agent for creators and solo builders who want a full AI outreach agent without expensive commitments.
      </p>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="border-b">
              <th className="text-left py-3 px-3 font-medium text-muted-foreground w-[22%]">Feature</th>
              <th className="text-left py-3 px-3 font-medium text-foreground bg-primary/5 border-x border-primary/10 w-[22%]">Your Echo Agent</th>
              <th className="text-left py-3 px-3 font-medium text-muted-foreground w-[18%]">AutoGTM</th>
              <th className="text-left py-3 px-3 font-medium text-muted-foreground w-[20%]">Instantly / Smartlead</th>
              <th className="text-left py-3 px-3 font-medium text-muted-foreground w-[18%]">Apollo</th>
            </tr>
          </thead>
          <tbody className="text-xs">
            {comparisonRows.map((row, i) => (
              <tr key={i} className="border-b last:border-0">
                <td className="py-3 px-3 font-medium text-foreground">{row.feature}</td>
                <td className="py-3 px-3 bg-primary/5 border-x border-primary/10 text-foreground">{row.us}</td>
                <td className="py-3 px-3 text-muted-foreground">{row.a}</td>
                <td className="py-3 px-3 text-muted-foreground">{row.b}</td>
                <td className="py-3 px-3 text-muted-foreground">{row.c}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile stacked cards */}
      <div className="md:hidden space-y-3">
        {mobileComparisonRows.map((row, i) => (
          <Card key={i} className="p-4 space-y-2">
            <p className="text-xs font-semibold text-foreground">{row.feature}</p>
            <div className="rounded-md bg-primary/5 border border-primary/10 p-2">
              <p className="text-xs font-medium text-primary">Your Echo Agent</p>
              <p className="text-xs text-foreground">{row.us}</p>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">{row.others}</p>
          </Card>
        ))}
      </div>
    </div>
  );
});
ComparisonSection.displayName = "ComparisonSection";

export const TrustSignals = React.forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="flex flex-wrap justify-center gap-6 mt-8 text-xs text-muted-foreground">
      <span className="flex items-center gap-1.5">✓ LinkedIn-native outreach</span>
      <span className="flex items-center gap-1.5">✓ 5-10x higher reply rates</span>
      <span className="flex items-center gap-1.5">✓ AI-powered personalization</span>
      <span className="flex items-center gap-1.5">✓ No monthly contracts</span>
    </div>
  );
});
TrustSignals.displayName = "TrustSignals";

export const WhyLinkedInFirstSection = React.forwardRef<HTMLDivElement>((_, ref) => {
  const reasons = [
    {
      icon: BarChart3,
      stat: "5-10x",
      label: "Higher Response Rates",
      desc: "LinkedIn messages outperform cold email by a wide margin. Decision makers actually read and reply to personalized connection requests.",
    },
    {
      icon: Target,
      label: "Smart Intent Targeting",
      desc: "Recent activity, job changes, funding rounds, and post engagement signal buying intent. Your agent finds the warmest leads first.",
    },
    {
      icon: Users,
      label: "Natural Conversation Style",
      desc: "No salesy templates. Your agent writes like a real person — building rapport first, pitching second. Leads feel heard, not sold to.",
    },
    {
      icon: Zap,
      label: "Safe, Human-Like Behavior",
      desc: "Smart pacing, realistic typing delays, and natural follow-up cadence keep your account healthy and restrictions at bay.",
    },
  ];

  return (
    <div ref={ref} className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Why LinkedIn-First Works Better
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Real replies, real meetings, real revenue — not just sent counts in a dashboard.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {reasons.map((r) => (
          <Card key={r.label} className="p-5 flex flex-col hover:border-primary/20 transition-all">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
              <r.icon className="w-5 h-5 text-primary" />
            </div>
            {r.stat && (
              <p className="text-2xl font-bold text-foreground mb-1">{r.stat}</p>
            )}
            <h3 className="font-semibold text-sm text-foreground mb-1">{r.label}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed flex-1">{r.desc}</p>
          </Card>
        ))}
      </div>
    </div>
  );
});
WhyLinkedInFirstSection.displayName = "WhyLinkedInFirstSection";
