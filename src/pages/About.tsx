import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { useNavigate, Link } from "react-router-dom";
import profileImg from "@/assets/profile-ladysoleil.png";
import { SeoHead } from "@/components/SeoHead";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SeoHead
        title="About Your Echo Agent — Built by @Ladysoleil"
        description="Built by a tech exec turned founder with 15+ years in PR. Autonomous outreach agents that sound exactly like you — without platform gouging."
        path="/about"
      />

      <header className="border-b bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => navigate("/")}>
            <Logo />
          </div>
          <div className="flex items-center gap-3">
            <Link to="/pricing" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
              Pricing
            </Link>
            <Button variant="ghost" size="sm" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </div>
        </div>
      </header>

      <main className="container max-w-2xl mx-auto px-4 py-16">
        <h1 className="sr-only">About Your Echo Agent — Our Story</h1>
        <Card className="p-8 md:p-10 glass space-y-6">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <img
              src={profileImg}
              alt="Ladysoleil profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-primary/30 shrink-0"
            />
          <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                About Your Echo Agent
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
            <p>
              I'm a tech executive turned builder with over 15 years in PR and Business Development. After launching 10+ AI projects, I kept hitting the same frustrating wall: needing to test outreach campaigns without getting hit with expensive platform fees.
            </p>
            <p className="text-foreground font-medium">
              So I built Your Echo Agent — a simple, affordable way to create autonomous outreach agents that sound exactly like you. Just paste your URL, and it generates personalized emails, LinkedIn messages, or multi-channel campaigns, sends them, and even handles replies intelligently.
            </p>
            <p>
              Whether you're a solo creator testing ideas or an AI agent looking to delegate outreach, the goal is the same: high-quality outreach without the gouging.
            </p>
            <p>
              I'm deeply passionate about AI tools that actually help creators and builders win. With my background working with big brands and high-profile clients in PR and marketing, I'm committed to turning Your Echo Agent into a powerful, reliable growth platform.
            </p>
            <p>
              I read every message and welcome your feedback — this project improves because of users like you.
            </p>
            <p className="font-medium">
              Let's build and win together.{" "}
              <a href="https://x.com/ladysoleil33" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                @Ladysoleil on X
              </a>
            </p>
            <p>
              P.S. I also run{" "}
              <a href="https://tablecharts.co" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">
                Tablecharts.co
              </a>{" "}
              — clean, beautiful charts for pitch decks and presentations.
            </p>
          </div>
        </Card>
      </main>
    </div>
  );
}
