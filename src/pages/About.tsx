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
            Hi, I'm{" "}
            <a href="https://x.com/ladysoleil33" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
              @Ladysoleil
            </a>{" "}
            on X
          </h2>

          <div className="space-y-4 text-muted-foreground text-sm leading-relaxed">
            <p>
              I'm a tech executive turned builder with 15+ years in PR and Business Development. Over the past few years I've launched more than 10 AI projects (yeah, I'm a bit obsessed).
            </p>
            <p>
              Every single time I finish one — after all the late nights and money spent — I hit the same wall: I need to send a batch of test emails to potential clients. But the tools out there? Free to start… until you actually want to send anything meaningful. Then it's $50+/month minimum. With 10 projects? No way I could afford that without knowing if any would even gain traction.
            </p>
            <p className="text-foreground font-medium">
              So I built <span className="italic">Your Echo Agent</span> — an extension of your voice. It lets you paste your URL, find leads, craft personalized emails that actually sound like you, send them, and even help handle the replies. Basically, it echoes a part of you out into the world — kindly — so you can test the waters without breaking the bank.
            </p>
            <p>
              If it starts getting bites? Cool — just add a little to cover costs and keep it running. I'm not here to gouge you.
            </p>
            <p>
              I genuinely love AI and I love creators like you. We need to support each other. When you build with purpose and help others succeed, it comes back around.
            </p>
            <p className="text-foreground font-medium">
              Thanks for stopping by on your journey. I want you to win. 💛
            </p>
          </div>

          <div className="pt-4 border-t border-border space-y-3">
            <p className="text-sm text-muted-foreground">
              P.S. I also own{" "}
              <a href="https://tablecharts.co" target="_blank" rel="noopener noreferrer" className="text-primary font-semibold hover:underline">
                Tablecharts.co
              </a>{" "}
              — if you ever need beautiful charts, graphs, or data visualizations for presentations, pitch decks, or business partners, feel free to check it out.
            </p>
            <p className="text-sm text-muted-foreground">
              I've worked with celebs and big brands for years in PR and Marketing, so as Your Echo Agent grows, I'll keep adding the pieces that actually help you grow (smart email is just the start).
            </p>
            <p className="text-sm text-muted-foreground font-medium">
              Ping me anytime if you run into issues or have suggestions — I'm always tweaking and improving based on real feedback. Let's build something that works. 🚀
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
