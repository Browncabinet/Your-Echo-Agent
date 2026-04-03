import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, ArrowLeft, ExternalLink } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <Zap className="w-6 h-6 text-primary" />
            <h1 className="text-lg font-bold text-foreground">Your Echo Agent</h1>
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
        <Card className="p-8 md:p-10 glass space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Why I Built This
          </h2>

          <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
            <p>
              I'm <a href="https://x.com/ladysoleil33" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">@ladysoleil33</a> — a developer with 8 projects in the works. Five of them needed cold email outreach and some marketing to get off the ground.
            </p>
            <p>
              Every tool I found was $50/month <span className="italic">per app</span>. That's $250/month just to test ideas. When you're bootstrapping and just need to send a few emails to see if something sticks, that's way too much.
            </p>
            <p>
              I couldn't find an AI vertical agent built specifically for cold emails — something simple, affordable, and actually useful for solo devs. So I built one.
            </p>
            <p className="text-foreground font-medium">
              Your Echo Agent echoes <span className="italic">your</span> voice and <span className="italic">your</span> style into an AI agent that writes emails for you. It starts free, scales cheap, and gets out of your way so you can focus on building.
            </p>
          </div>

          <div className="pt-4 border-t border-border">
            <p className="text-sm text-muted-foreground mb-3">Get in touch or follow the journey:</p>
            <a
              href="https://x.com/ladysoleil33"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline text-sm"
            >
              @ladysoleil33 on X <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </Card>
      </main>
    </div>
  );
}
