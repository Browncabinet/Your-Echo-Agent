import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";
import { Logo } from "@/components/Logo";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { FeaturesSection, ComparisonSection, TrustSignals } from "@/components/MarketingSections";
import { MarketplaceSection, LeaderboardSection, ForAgentsSection } from "@/components/MarketplaceSections";
import { Footer } from "@/components/Footer";
import { Badge } from "@/components/ui/badge";
import { Bot } from "lucide-react";

export default function Auth() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  const handleGoogle = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (result.error) {
      toast({ title: "Error", description: "Google sign-in failed. Please try again.", variant: "destructive" });
    }
    if (result.redirected) return;
    navigate("/");
  };

  const features = [
    "Scrape contacts from any website",
    "AI-written emails that convert",
    "Track opens, clicks & results",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-6 py-4 border-b border-border">
        <Logo />
        <div className="flex items-center gap-4">
          <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
            About
          </Link>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1">
        {/* Hero + Sign-in */}
        <div className="flex items-center justify-center px-4 py-10">
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
            {/* Left: Hero */}
            <div className="space-y-6">
              <Badge variant="secondary" className="inline-flex">
                <Bot className="w-3 h-3 mr-1" /> A2A Marketplace · MCP Compatible
              </Badge>
              <h1 className="text-3xl md:text-4xl font-bold text-foreground leading-tight">
                Your Echo Agent — Outreach Agents That{" "}
                <span className="text-primary">Other Agents Can Hire</span>
              </h1>
              <p className="text-muted-foreground text-base">
                Simple A2A marketplace. Any Claw, Hermes, or A2A agent can discover, rent, and delegate personalized outreach campaigns 24/7.
              </p>
              <div className="rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
                <span className="font-semibold text-foreground">Human-friendly too:</span> paste your URL and we'll run outreach for you — no agent setup required.
              </div>
              <ul className="space-y-3">
                {features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-foreground">
                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                      <Check className="w-3.5 h-3.5 text-primary" />
                    </div>
                    <span className="text-sm">{f}</span>
                  </li>
                ))}
              </ul>
              <TrustSignals />
              <Link
                to="/pricing"
                className="inline-block text-sm font-semibold text-primary hover:underline underline-offset-4"
              >
                Starting at $0/mo — View plans →
              </Link>
            </div>

            {/* Right: Login card */}
            <Card className="w-full max-w-sm mx-auto md:mx-0 p-8 space-y-6 glass">
              <div className="text-center space-y-1">
                <h2 className="text-lg font-bold text-foreground">
                  Sign in with Google to get started
                </h2>
                <p className="text-xs text-muted-foreground">One click — no passwords needed</p>
              </div>

              <Button onClick={handleGoogle} variant="glass" className="w-full gap-2 py-5">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </Button>
            </Card>
          </div>
        </div>

        {/* Marketing sections */}
        <div className="container max-w-5xl mx-auto px-4 pb-10">
          <FeaturesSection />
          <ComparisonSection />
        </div>
      </div>

      <Footer />
    </div>
  );
}
