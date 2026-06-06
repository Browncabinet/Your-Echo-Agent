import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, MessageSquareReply, TrendingUp, BarChart3, Zap, Users, Target, ShieldCheck, Check, ArrowRight } from "lucide-react";
import { NICHES } from "@/lib/campaign-data";

const comparisonRows = [
  { feature: "Paste URL → Campaign", us: "✅ Zero-form Quick Start + Guided mode", a: "✅ Very fast drafts", b: "— List upload required", c: "— Manual setup" },
  { feature: "AI Research & Personalization", us: "✅ Reads your site + niche community signals", a: "✅ Strong deep research", b: "⚠️ Template + basic AI", c: "✅ Large database + signals" },
  { feature: "Niche & Association Outreach", us: "✅ Targets industry events, associations & communities", a: "— Email only", b: "— Email only", c: "— Email only" },
  { feature: "Community Comment + Email Hybrid", us: "✅ Comments in communities + targeted emails", a: "— Limited / not included", b: "⚠️ Basic sequences", c: "⚠️ Basic" },
  { feature: "Reply Handling", us: "✅ AI classifies + books meetings", a: "— Limited / not included", b: "⚠️ Basic sequences", c: "⚠️ Basic" },
  { feature: "Meeting Booking", us: "✅ Auto-books calls into your calendar", a: "— Not included", b: "— Not included", c: "— Not included" },
  { feature: "Pricing Model", us: "🟢 Flexible – pay as you grow", a: "💰 Monthly subscription", b: "💰 $30–$300+/mo", c: "💰 $49+/mo+" },
  { feature: "Best For", us: "Solo builders & niche-focused professionals", a: "Teams wanting fast AI drafts", b: "High-volume sending teams", c: "Large sales teams" },
];

const mobileComparisonRows = [
  { feature: "Paste URL → Campaign", us: "✅ Zero-form Quick Start + Guided mode", others: "AutoGTM: ✅ Fast drafts · Instantly: — List upload · Apollo: — Manual" },
  { feature: "AI Research & Personalization", us: "✅ Reads your site + niche community signals", others: "AutoGTM: ✅ Deep research · Instantly: ⚠️ Basic AI · Apollo: ✅ Large DB" },
  { feature: "Niche & Association Outreach", us: "✅ Targets industry events, associations & communities", others: "AutoGTM: — Email only · Instantly: — Email only · Apollo: — Email only" },
  { feature: "Community Comment + Email Hybrid", us: "✅ Comments in communities + targeted emails", others: "AutoGTM: — Limited · Instantly: ⚠️ Basic · Apollo: ⚠️ Basic" },
  { feature: "Reply Handling", us: "✅ AI classifies + books meetings", others: "AutoGTM: — Limited · Instantly: ⚠️ Basic · Apollo: ⚠️ Basic" },
  { feature: "Meeting Booking", us: "✅ Auto-books calls into your calendar", others: "AutoGTM: — Not included · Instantly: — Not included · Apollo: — Not included" },
  { feature: "Pricing Model", us: "🟢 Flexible – pay as you grow", others: "AutoGTM: 💰 Monthly · Instantly: 💰 $30–$300+/mo · Apollo: 💰 $49+/mo" },
  { feature: "Best For", us: "Solo builders & niche-focused professionals", others: "AutoGTM: AI-first teams · Instantly: High-volume · Apollo: Large sales teams" },
];

const nicheCategories = NICHES;

export const FeaturesSection = React.forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="mb-14">
      <h3 className="text-center text-lg font-semibold text-foreground mb-6">
        How Your Echo Agent Works
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="p-5 text-center">
          <div className="mx-auto w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
            <Target className="w-5 h-5 text-primary" />
          </div>
          <h4 className="font-semibold text-sm text-foreground mb-1">Choose Your Niche</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Pick your industry or association. Your agent stays focused where trust matters most.
          </p>
        </Card>
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
            <Users className="w-5 h-5 text-primary" />
          </div>
          <h4 className="font-semibold text-sm text-foreground mb-1">Find Relevant Discussions</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Discovers conversations inside associations, events, and professional communities.
          </p>
        </Card>
        <Card className="p-5 text-center">
          <div className="mx-auto w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
            <MessageSquareReply className="w-5 h-5 text-primary" />
          </div>
          <h4 className="font-semibold text-sm text-foreground mb-1">Comments + Targeted Emails</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Posts helpful comments and sends personalized emails inside the same niche — all sounding like you.
          </p>
        </Card>
        <Card className="p-5 text-center">
          <div className="mx-auto w-10 h-10 rounded-full bg-secondary flex items-center justify-center mb-3">
            <TrendingUp className="w-5 h-5 text-primary" />
          </div>
          <h4 className="font-semibold text-sm text-foreground mb-1">Turn Conversations Into Opportunities</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Handles replies, books calls, and tracks real relationships — not just sent counts.
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
      <span className="flex items-center gap-1.5">✓ Niche-native outreach</span>
      <span className="flex items-center gap-1.5">✓ 3-5x higher trust & response</span>
      <span className="flex items-center gap-1.5">✓ AI-powered personalization</span>
      <span className="flex items-center gap-1.5">✓ No monthly contracts</span>
    </div>
  );
});
TrustSignals.displayName = "TrustSignals";

export const WhyNicheFirstSection = React.forwardRef<HTMLDivElement>((_, ref) => {
  const reasons = [
    {
      icon: ShieldCheck,
      stat: "3-5x",
      label: "Higher Trust & Response",
      desc: "Outreach inside industry associations and events feels natural. Recipients see you as a peer, not a stranger.",
    },
    {
      icon: Target,
      label: "Precision Targeting",
      desc: "Your agent finds the right discussions, job changes, and funding news inside your specific niche — no spray-and-pray.",
    },
    {
      icon: Users,
      label: "Community-First Conversations",
      desc: "Helpful comments in the right communities build reputation before you ever send an email. Relationships first, pitches second.",
    },
    {
      icon: Zap,
      label: "Sustainable, Long-Term Growth",
      desc: "Staying inside your industry protects your reputation and creates a compounding network of warm connections.",
    },
  ];

  return (
    <div ref={ref} className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Why Niche-First Works Better
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Real replies, real meetings, real revenue — built on trust inside the communities you belong to.
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
WhyNicheFirstSection.displayName = "WhyNicheFirstSection";

export const ChooseYourNicheSection = React.forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div ref={ref} className="mb-16">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Choose Your Industry
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Your Echo Agent will focus outreach inside your specific niche — associations, conferences, events, and organizations — for maximum relevance and trust.
        </p>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {nicheCategories.map((cat) => (
          <Card key={cat} className="p-4 text-center hover:border-primary/30 transition-all cursor-default">
            <p className="text-sm font-medium text-foreground">{cat}</p>
          </Card>
        ))}
      </div>
    </div>
  );
});
ChooseYourNicheSection.displayName = "ChooseYourNicheSection";
