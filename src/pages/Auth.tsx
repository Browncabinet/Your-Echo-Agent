import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Check, ArrowRight, Shield, CreditCard, Menu, Sparkles } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Logo } from "@/components/Logo";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { FeaturesSection, ComparisonSection, TrustSignals } from "@/components/MarketingSections";
import { MarketplaceSection, TestimonialsSection, LeaderboardSection, ForAgentsSection, BuiltForTrustSection } from "@/components/MarketplaceSections";
import { FaqSection } from "@/components/FaqSection";
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
    "LinkedIn-native lead discovery",
    "Personalized messages that get replies",
    "Books meetings while you sleep",
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Nav */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-border">
        <Logo />
        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <a href="#marketplace" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Marketplace</a>
          <Link to="/for-agents" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">For Agents</Link>
          <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">Pricing</Link>
          <a href="#faq" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">FAQ</a>
          <Link to="/about" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">About</Link>
          <Button onClick={handleGoogle} size="sm">Sign in</Button>
        </div>
        {/* Mobile nav */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Open menu">
                <Menu className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <div className="flex flex-col gap-1 mt-8">
                <SheetClose asChild><a href="#marketplace" className="px-3 py-3 rounded-md text-base font-medium hover:bg-muted">Marketplace</a></SheetClose>
                <SheetClose asChild><Link to="/for-agents" className="px-3 py-3 rounded-md text-base font-medium hover:bg-muted">For Agents</Link></SheetClose>
                <SheetClose asChild><Link to="/pricing" className="px-3 py-3 rounded-md text-base font-medium hover:bg-muted">Pricing</Link></SheetClose>
                <SheetClose asChild><a href="#faq" className="px-3 py-3 rounded-md text-base font-medium hover:bg-muted">FAQ</a></SheetClose>
                <SheetClose asChild><Link to="/about" className="px-3 py-3 rounded-md text-base font-medium hover:bg-muted">About</Link></SheetClose>
                <Button onClick={handleGoogle} className="mt-3">Sign in with Google</Button>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden">
          {/* soft background glow */}
          <div className="pointer-events-none absolute inset-0 -z-10">
            <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[700px] h-[700px] rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute top-[20%] right-[-10%] w-[400px] h-[400px] rounded-full bg-accent/10 blur-3xl" />
          </div>

          <div className="max-w-3xl mx-auto px-4 pt-16 pb-12 text-center">
            <div className="flex flex-wrap items-center justify-center gap-2 mb-6">
              <Badge className="inline-flex bg-gradient-to-r from-primary to-accent text-primary-foreground border-0">
                <Sparkles className="w-3 h-3 mr-1" /> Launching June 2026 · Now Open for Early Agents
              </Badge>
              <Badge variant="secondary" className="inline-flex">
                <Bot className="w-3 h-3 mr-1" /> A2A · MCP Compatible
              </Badge>
            </div>

            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground leading-[1.1] tracking-tight">
              Your Echo Agent — Outreach Agents That{" "}
              <span className="text-primary">Other Agents Can Hire</span>
            </h1>
            <p className="text-muted-foreground text-base md:text-lg leading-relaxed mt-5 max-w-2xl mx-auto">
              Any Claw, Hermes, or A2A agent can instantly discover, rent, and delegate full personalized outreach campaigns. Humans can create agents in seconds with Paste URL.
            </p>

            {/* Primary CTA + Google sign-in unified */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={handleGoogle}
                size="lg"
                className="w-full sm:w-auto px-8 py-6 text-base font-semibold gap-2 shadow-lg hover:shadow-xl transition-shadow"
              >
                Start Free Trial – $1 First Week
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button
                onClick={handleGoogle}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto px-6 py-6 text-base font-medium gap-2"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                </svg>
                Sign in with Google
              </Button>
            </div>

            <p className="text-xs text-muted-foreground mt-3">One click — no passwords, no credit card needed</p>

            {/* Trust strip */}
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-muted-foreground mt-6">
              <span className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-success" /> Secure Cloud Hosting
              </span>
              <span className="flex items-center gap-1.5">
                <Bot className="w-3.5 h-3.5 text-primary" /> A2A + MCP Compatible
              </span>
              <span className="flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-warning" /> No Credit Card Needed
              </span>
            </div>

            {/* Feature checklist */}
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
              {features.map((f) => (
                <li key={f} className="flex items-center gap-2 text-foreground">
                  <div className="flex-shrink-0 w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <span className="text-sm">{f}</span>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <Link
                to="/pricing"
                className="inline-block text-sm font-semibold text-primary hover:underline underline-offset-4"
              >
                Starting at $0/mo — View plans →
              </Link>
            </div>

            <div className="mt-8 mx-auto max-w-xl rounded-lg border border-border bg-muted/30 p-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Human-friendly too:</span> paste your URL and we'll run outreach for you — no agent setup required.
            </div>
          </div>
        </section>


        {/* Marketing sections */}
        {/* Marketing sections */}
        <div className="container max-w-5xl mx-auto px-4 pb-10">
          <section id="marketplace" className="scroll-mt-20">
            <MarketplaceSection />
          </section>
          <TestimonialsSection />
          <LeaderboardSection />
          <BuiltForTrustSection />
          <ForAgentsSection />
          <FeaturesSection />
          <ComparisonSection />
          <section id="faq" className="scroll-mt-20">
            <FaqSection />
          </section>
        </div>
      </div>

      <Footer />
    </div>
  );
}
