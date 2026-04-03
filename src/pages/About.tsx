import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Zap, ArrowLeft, ExternalLink } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import profileImg from "@/assets/profile-ladysoleil.png";

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
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <img
              src={profileImg}
              alt="Ladysoleil profile"
              className="w-24 h-24 rounded-full object-cover border-2 border-primary/30 shrink-0"
            />
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-foreground">
                Hi, I'm{" "}
                <a href="https://x.com/ladysoleil33" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                  @Ladysoleil
                </a>{" "}
                on X
              </h2>
            </div>
          </div>

          <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
            <p>
              I'm a tech executive turned builder with 15+ years in PR and Business Development. I've launched 10+ AI projects, and every time I finish one, I hit the same frustrating wall — needing to send test emails without getting price-gouged.
            </p>
            <p className="text-foreground font-medium">
              So I built <span className="italic">Your Echo Agent</span> — an extension of your voice. Paste your URL, get personalized emails that actually sound like you, send them, and even handle replies. Perfect for testing the waters affordably.
            </p>
            <p>
              If it gets bites, just add a little to cover costs. No gouging here.
            </p>
            <p>
              I love AI and I love creators. We need to support each other. 💛
            </p>
          </div>

          <div className="pt-4 border-t border-border space-y-3">
            <p className="text-sm text-muted-foreground">
              P.S. I also own{" "}
              <a href="https://tablecharts.co" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">
                Tablecharts.co
              </a>{" "}
              — if you need clean, beautiful charts for presentations or pitch decks, feel free to check it out.
            </p>
            <p className="text-sm text-muted-foreground">
              With years of PR & Marketing experience working with celebs and big brands, I'll keep growing Your Echo Agent into a real growth tool.
            </p>
            <p className="text-sm text-muted-foreground font-medium">
              Ping me anytime with issues or suggestions — I'm always improving it. Let's win together. 🚀
            </p>
            <a
              href="https://x.com/ladysoleil33"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-primary font-semibold hover:underline text-sm"
            >
              @Ladysoleil on X <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </Card>
      </main>
    </div>
  );
}
