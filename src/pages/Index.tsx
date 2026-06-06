import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StepIndicator } from "@/components/StepIndicator";
import { CampaignSetup } from "@/components/steps/CampaignSetup";
import { LeadAcquisition } from "@/components/steps/LeadAcquisition";
import { EmailBuilder } from "@/components/steps/EmailBuilder";
import { ReviewApproval } from "@/components/steps/ReviewApproval";
import { ResultsDashboard } from "@/components/steps/ResultsDashboard";
import { SocialMediaContent } from "@/components/steps/SocialMediaContent";
import { type Campaign, createEmptyCampaign } from "@/lib/campaign-data";
import { Plus, BarChart3, Share2, LogOut, Loader2, Inbox, Sparkles, Coins, Linkedin, ArrowLeft, Pause, Play } from "lucide-react";
import { Logo } from "@/components/Logo";
import { FeaturesSection, ComparisonSection, TrustSignals, WhyNicheFirstSection, ChooseYourNicheSection } from "@/components/MarketingSections";
import { MarketplaceSection, LeaderboardSection, ForAgentsSection } from "@/components/MarketplaceSections";
import { HomePricingSection } from "@/components/HomePricingSection";
import { FaqSection } from "@/components/FaqSection";
import { useCredits } from "@/hooks/use-credits";
import { BuyCreditsModal } from "@/components/BuyCreditsModal";
import { PaymentTestModeBanner } from "@/components/PaymentTestModeBanner";
import { RepliesInbox } from "@/components/steps/RepliesInbox";
import { QuickUpdateBar } from "@/components/dashboard/QuickUpdateBar";
import { CampaignQuickSummary } from "@/components/dashboard/CampaignQuickSummary";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCampaigns } from "@/hooks/use-campaigns";
import { QuickStartModal } from "@/components/QuickStartModal";
import { WelcomeModal } from "@/components/WelcomeModal";

type View = "home" | "campaign" | "dashboard" | "social" | "replies";

export default function Index() {
  const [view, setView] = useState<View>("home");
  const [step, setStep] = useState(0);
  const [campaign, setCampaign] = useState<Campaign>(createEmptyCampaign());
  const [quickStartOpen, setQuickStartOpen] = useState(false);
  const [buyCreditsOpen, setBuyCreditsOpen] = useState(false);
  const { campaigns, loading: campaignsLoading, saveCampaign } = useCampaigns();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { balance, loading: creditsLoading } = useCredits();
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    if (!user) return;
    const key = `echo_welcomed_${user.id}`;
    if (!localStorage.getItem(key)) {
      setShowWelcome(true);
      localStorage.setItem(key, "1");
    }
  }, [user]);
  const updateCampaign = (updates: Partial<Campaign>) => {
    setCampaign((c) => ({ ...c, ...updates }));
  };

  const startNewCampaign = () => {
    setCampaign(createEmptyCampaign());
    setStep(0);
    setView("campaign");
  };

  const handleQuickStart = (quickCampaign: Campaign, skipSetup = true) => {
    setCampaign(quickCampaign);
    setStep(skipSetup ? 1 : 0);
    setView("campaign");
    setQuickStartOpen(false);
  };

  const handleSend = async () => {
    const updated = { ...campaign, status: "active" as const };
    setCampaign(updated);
    await saveCampaign(updated);
    setView("dashboard");
  };

  const togglePause = async () => {
    const next = campaign.status === "paused" ? "active" : "paused";
    const updated = { ...campaign, status: next as Campaign["status"] };
    setCampaign(updated);
    await saveCampaign(updated);
  };

  const steps = [
    { label: "Setup", completed: step > 0, active: step === 0 },
    { label: "Leads", completed: step > 1, active: step === 1 },
    { label: "Emails", completed: step > 2, active: step === 2 },
    { label: "Review", completed: step > 3, active: step === 3 },
  ];

  if (view === "home") {
    return (
      <div className="min-h-screen bg-background">
        <PaymentTestModeBanner />
        <header className="border-b bg-card">
          <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setBuyCreditsOpen(true)} className="gap-1.5 text-xs">
                <Coins className="w-3.5 h-3.5 text-primary" />
                <span className="font-medium text-foreground">{creditsLoading ? "…" : balance}</span>
                <span className="text-muted-foreground">emails</span>
              </Button>
              <Avatar className="h-8 w-8 cursor-pointer" onClick={() => setView("home")} role="button" aria-label="Go to home">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-xs">{user?.email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-1 text-muted-foreground" aria-label="Sign out">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container max-w-5xl mx-auto px-4 py-10">
          {/* Hero Section */}
          <div className="text-center mb-14 pt-6">
            <h1 className="text-4xl sm:text-5xl font-bold text-foreground leading-tight max-w-3xl mx-auto">
              Your Echo Agent — Niche Outreach That{" "}
              <span className="text-primary">Gets Real Results</span>
            </h1>
            <p className="text-muted-foreground mt-4 text-lg max-w-2xl mx-auto leading-relaxed">
              <span className="font-semibold text-foreground">Builders:</span> Paste your URL to create an agent that sounds exactly like you.{" "}
              <span className="font-semibold text-foreground">Agents:</span> Discover, rent, and delegate campaigns via A2A. Focus on high-trust outreach in associations, conferences, events, and industry organizations on LinkedIn and targeted email.
            </p>


            <div className="flex flex-col sm:flex-row justify-center gap-3 mt-8">
              <Button size="lg" onClick={startNewCampaign} className="gap-2 text-lg px-10 py-7 shadow-lg hover:shadow-xl transition-shadow">
                <Plus className="w-5 h-5" /> New Campaign
              </Button>
              <Button size="lg" variant="outline" onClick={() => setQuickStartOpen(true)} className="gap-2 text-base px-8 py-7 border-primary/30 text-primary hover:bg-primary/5">
                <Sparkles className="w-5 h-5" /> Fast Mode — Paste URL Only
              </Button>
            </div>

            <TrustSignals />
          </div>

          <HomePricingSection />
          <FeaturesSection />
          <ComparisonSection />
          <ChooseYourNicheSection onContinue={startNewCampaign} />
          <WhyNicheFirstSection />
          <MarketplaceSection />
          <LeaderboardSection />
          <ForAgentsSection />
          <FaqSection />

          <QuickUpdateBar campaigns={campaigns} />

          {campaignsLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {!campaignsLoading && campaigns.length === 0 && (
            <Card className="p-8 text-center border-dashed">
              <p className="text-muted-foreground text-sm">No campaigns yet. Create your first one above.</p>
            </Card>
          )}

          {campaigns.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Your Recent Campaigns</h3>
              {campaigns.map((c) => (
                <Card
                  key={c.id}
                  className="p-4 cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setCampaign(c);
                    setView("dashboard");
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground">{c.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {c.websiteUrl && <>{(() => { try { return new URL(c.websiteUrl).hostname; } catch { return c.websiteUrl; } })()} · </>}
                        {c.niche} · {c.leads.length} leads
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCampaign(c);
                          setView("dashboard");
                        }}
                      >
                        <BarChart3 className="w-3 h-3" /> Results
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCampaign(c);
                          setView("replies");
                        }}
                      >
                        <Inbox className="w-3 h-3" /> Replies
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCampaign(c);
                          setView("social");
                        }}
                      >
                        <Share2 className="w-3 h-3" /> Social
                      </Button>
                    </div>
                  </div>
                  <CampaignQuickSummary campaign={c} />
                </Card>
              ))}
            </div>
          )}
        </main>

        <QuickStartModal
          open={quickStartOpen}
          onOpenChange={setQuickStartOpen}
          onStartCampaign={handleQuickStart}
        />
        <BuyCreditsModal open={buyCreditsOpen} onOpenChange={setBuyCreditsOpen} />
        <WelcomeModal
          open={showWelcome}
          onOpenChange={setShowWelcome}
          onTryFastMode={() => { setShowWelcome(false); setQuickStartOpen(true); }}
        />
      </div>
    );
  }

  if (view === "dashboard") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="cursor-pointer" onClick={() => setView("home")}>
              <Logo />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setView("home")} className="gap-1 text-muted-foreground">
                <ArrowLeft className="w-3.5 h-3.5" /> Campaigns
              </Button>
              {(campaign.status === "active" || campaign.status === "paused") && (
                <Button
                  variant={campaign.status === "paused" ? "default" : "outline"}
                  size="sm"
                  onClick={togglePause}
                  className="gap-1"
                >
                  {campaign.status === "paused" ? (
                    <><Play className="w-3 h-3" /> Resume</>
                  ) : (
                    <><Pause className="w-3 h-3" /> Pause</>
                  )}
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={startNewCampaign} className="gap-1">
                <Plus className="w-3 h-3" /> New Campaign
              </Button>
              <Button variant="outline" size="sm" onClick={() => setView("replies")} className="gap-1">
                <Inbox className="w-3 h-3" /> Replies
              </Button>
              <Button variant="outline" size="sm" onClick={() => setView("social")} className="gap-1">
                <Share2 className="w-3 h-3" /> Social Content
              </Button>
              <Avatar className="h-8 w-8 cursor-pointer" onClick={() => setView("home")}>
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-xs">{user?.email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <main className="container max-w-5xl mx-auto px-4 py-8">
          <ResultsDashboard campaign={campaign} onBack={() => setView("home")} />
        </main>
      </div>
    );
  }

  if (view === "replies") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
            <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="cursor-pointer" onClick={() => setView("home")}>
              <Logo />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setView("home")} className="gap-1 text-muted-foreground">
                <ArrowLeft className="w-3.5 h-3.5" /> Campaigns
              </Button>
              <Button variant="outline" size="sm" onClick={startNewCampaign} className="gap-1">
                <Plus className="w-3 h-3" /> New Campaign
              </Button>
              <Button variant="outline" size="sm" onClick={() => setView("social")} className="gap-1">
                <Share2 className="w-3 h-3" /> Social Content
              </Button>
              <Avatar className="h-8 w-8 cursor-pointer" onClick={() => setView("home")}>
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-xs">{user?.email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <main className="container max-w-5xl mx-auto px-4 py-8">
          <RepliesInbox
            campaignId={campaign.id}
            onBack={() => setView("dashboard")}
          />
        </main>
      </div>
    );
  }

  if (view === "social") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="cursor-pointer" onClick={() => setView("home")}>
              <Logo />
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" onClick={() => setView("home")} className="gap-1 text-muted-foreground">
                <ArrowLeft className="w-3.5 h-3.5" /> Campaigns
              </Button>
              <Button variant="outline" size="sm" onClick={startNewCampaign} className="gap-1">
                <Plus className="w-3 h-3" /> New Campaign
              </Button>
              <Button variant="outline" size="sm" onClick={() => setView("replies")} className="gap-1">
                <Inbox className="w-3 h-3" /> Replies
              </Button>
              <Avatar className="h-8 w-8 cursor-pointer" onClick={() => setView("home")}>
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-xs">{user?.email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </header>
        <main className="container max-w-5xl mx-auto px-4 py-8">
          <SocialMediaContent campaign={campaign} onBack={() => setView("dashboard")} />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="cursor-pointer" onClick={() => setView("home")}>
              <Logo />
            </div>
            <Avatar className="h-8 w-8 cursor-pointer" onClick={() => setView("home")}>
              <AvatarImage src={user?.user_metadata?.avatar_url} />
              <AvatarFallback className="text-xs">{user?.email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
            </Avatar>
        </div>
      </header>

      <main className="container max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <StepIndicator steps={steps} />
        </div>

        {step === 0 && (
          <CampaignSetup campaign={campaign} onUpdate={updateCampaign} onNext={() => setStep(1)} />
        )}
        {step === 1 && (
          <LeadAcquisition campaign={campaign} onUpdate={updateCampaign} onNext={() => setStep(2)} onBack={() => setStep(0)} />
        )}
        {step === 2 && (
          <EmailBuilder campaign={campaign} onUpdate={updateCampaign} onNext={() => setStep(3)} onBack={() => setStep(1)} />
        )}
        {step === 3 && (
          <ReviewApproval campaign={campaign} onUpdate={updateCampaign} onSend={handleSend} onBack={() => setStep(2)} />
        )}
      </main>
    </div>
  );
}
