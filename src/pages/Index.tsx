import { useState } from "react";
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
import { Plus, Zap, BarChart3, Share2, LogOut, CreditCard, Loader2, Inbox } from "lucide-react";
import { RepliesInbox } from "@/components/steps/RepliesInbox";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useCampaigns } from "@/hooks/use-campaigns";

type View = "home" | "campaign" | "dashboard" | "social" | "replies";

export default function Index() {
  const [view, setView] = useState<View>("home");
  const [step, setStep] = useState(0);
  const [campaign, setCampaign] = useState<Campaign>(createEmptyCampaign());
  const { campaigns, loading: campaignsLoading, saveCampaign } = useCampaigns();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const updateCampaign = (updates: Partial<Campaign>) => {
    setCampaign((c) => ({ ...c, ...updates }));
  };

  const startNewCampaign = () => {
    setCampaign(createEmptyCampaign());
    setStep(0);
    setView("campaign");
  };

  const handleSend = async () => {
    const updated = { ...campaign, status: "active" as const };
    setCampaign(updated);
    await saveCampaign(updated);
    setView("dashboard");
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
        <header className="border-b bg-card">
          <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-6 h-6 text-primary" />
              <h1 className="text-lg font-bold text-foreground">Your Echo Agent</h1>
            </div>
            <div className="flex items-center gap-3">
              <p className="text-xs text-muted-foreground hidden sm:block">AI Marketing & Outreach</p>
              <Button variant="glass" size="sm" onClick={() => navigate("/pricing")} className="gap-1 text-xs">
                <CreditCard className="w-3 h-3" /> Upgrade
              </Button>
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="text-xs">{user?.email?.[0]?.toUpperCase() ?? "U"}</AvatarFallback>
              </Avatar>
              <Button variant="ghost" size="sm" onClick={signOut} className="gap-1 text-muted-foreground">
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </header>

        <main className="container max-w-5xl mx-auto px-4 py-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-foreground">
              Launch Your Outreach Campaign
            </h2>
            <p className="text-muted-foreground mt-2 max-w-md mx-auto">
              Find leads, craft personalized emails, and grow your business — all in one place.
            </p>
          </div>

          <div className="flex justify-center mb-10">
            <Button size="lg" onClick={startNewCampaign} className="gap-2 text-base px-8 py-6">
              <Plus className="w-5 h-5" /> New Campaign
            </Button>
          </div>

          {campaignsLoading && (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}

          {campaigns.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Your Campaigns</h3>
              {campaigns.map((c) => (
                <Card
                  key={c.id}
                  className="p-4 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    setCampaign(c);
                    setView("dashboard");
                  }}
                >
                  <div>
                    <p className="font-medium text-foreground">{c.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {c.websiteUrl && <>{new URL(c.websiteUrl).hostname} · </>}
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
                        setView("social");
                      }}
                    >
                      <Share2 className="w-3 h-3" /> Social
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    );
  }

  if (view === "dashboard") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView("home")}>
              <Zap className="w-6 h-6 text-primary" />
              <h1 className="text-lg font-bold text-foreground">Your Echo Agent</h1>
            </div>
            <Button variant="outline" size="sm" onClick={() => setView("social")} className="gap-1">
              <Share2 className="w-3 h-3" /> Social Content
            </Button>
          </div>
        </header>
        <main className="container max-w-5xl mx-auto px-4 py-8">
          <ResultsDashboard campaign={campaign} onBack={() => setView("home")} />
        </main>
      </div>
    );
  }

  if (view === "social") {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center gap-2 cursor-pointer" onClick={() => setView("home")}>
            <Zap className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Your Echo Agent</h1>
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
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setView("home")}>
            <Zap className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Your Echo Agent</h1>
          </div>
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
