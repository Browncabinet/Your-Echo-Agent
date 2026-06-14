import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Footer } from "@/components/Footer";
import { useNavigate, Link } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";

export default function About() {
  const navigate = useNavigate();

  return (
    <div
      className="min-h-screen flex flex-col bg-[#06061a] text-slate-200 font-[Manrope,system-ui,sans-serif] relative overflow-hidden"
    >
      <SeoHead
        title="About Your Echo Agent — A Real PR Technique, Automated"
        description="Autonomous outreach agents that find niche LinkedIn contacts via groups and associations, then send personalized email — a real PR technique, automated."
        path="/about"
      />

      {/* Ambient background glows */}
      <div className="pointer-events-none absolute inset-0 -z-0">
        <div className="absolute -top-40 -left-32 w-[520px] h-[520px] rounded-full bg-indigo-600/20 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[480px] h-[480px] rounded-full bg-fuchsia-600/15 blur-3xl" />
        <div className="absolute inset-0 opacity-[0.04] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]" />
      </div>

      <header className="relative z-10 border-b border-white/5">
        <div className="container max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="cursor-pointer" onClick={() => navigate("/")}>
            <Logo />
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/pricing"
              className="text-sm font-medium text-slate-400 hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(-1)}
              className="text-slate-300 hover:text-white hover:bg-white/5"
            >
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
          </div>
        </div>
      </header>

      <main className="relative z-10 flex-1 container max-w-2xl mx-auto px-4 py-16">
        <h1 className="sr-only">About Your Echo Agent</h1>
        <div className="rounded-2xl border border-indigo-500/15 bg-gradient-to-b from-indigo-950/40 to-[#06061a]/80 backdrop-blur-sm shadow-[0_0_60px_-20px_rgba(99,102,241,0.35)] p-8 md:p-10 space-y-8">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-indigo-500/30 bg-indigo-500/10 text-xs font-medium text-indigo-300">
              About
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
              About Your Echo Agent
            </h2>
            <p className="text-lg text-slate-300 leading-relaxed">
              Outreach that actually sounds like a real person — because it's built on a real PR technique.
            </p>
          </div>

          <div className="space-y-6 text-[15px] leading-relaxed text-slate-300">
            <section>
              <h3 className="text-white font-semibold mb-1">What it is</h3>
              <p>
                Your Echo Agent is an autonomous outreach platform that clones your approach — your way of sending messages — finds the right people, drafts hyper-personalized emails and LinkedIn messages, sends them, and handles replies intelligently — at a price that doesn't punish you for testing.
              </p>
            </section>

            <section>
              <h3 className="text-white font-semibold mb-1">Why it's different</h3>
              <p>
                Most cold-email tools blast generic templates at scraped lists. Your Echo Agent uses a technique borrowed from senior marketing, sales, and PR executives: discover contacts on LinkedIn through the{" "}
                <span className="text-white font-medium">
                  groups, organizations, and associations they actually follow in niche markets
                </span>
                {" "}— then engage with their content (comments, reactions) before sending an email. Every message lands warm, in-context, and human.
              </p>
            </section>

            <section>
              <h3 className="text-white font-semibold mb-1">Who built it</h3>
              <p>
                Built by a tech business development executive and publicist with{" "}
                <span className="text-white font-medium">15+ startup launches</span>{" "}
                across PR, growth, and product. The same playbook used to land coverage in top publications and book meetings for founders is now wired into an agent anyone can run.
              </p>
            </section>

            <section className="pt-2 border-t border-white/5">
              <h3 className="text-white font-semibold mb-1">Contact</h3>
              <p>
                Questions, feedback, or partnerships → DM{" "}
                <a
                  href="https://x.com/ladysoleil33"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-300 hover:text-white font-medium underline underline-offset-4 decoration-indigo-500/40 hover:decoration-white transition-colors"
                >
                  @ladysoleil33 on X
                </a>
                .
              </p>
              <p className="mt-3 text-sm text-slate-400">
                P.S. I also run{" "}
                <a
                  href="https://tablecharts.co"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-300 hover:text-white font-medium underline underline-offset-4 decoration-indigo-500/40 hover:decoration-white transition-colors"
                >
                  Tablecharts.co
                </a>{" "}
                — clean, beautiful charts for pitch decks and presentations.
              </p>
            </section>
          </div>
        </div>
      </main>

      <div className="relative z-10">
        <Footer />
      </div>
    </div>
  );
}
