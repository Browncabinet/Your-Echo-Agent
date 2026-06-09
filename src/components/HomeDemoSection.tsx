import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Link2, Users, Mail, BarChart3, ArrowRight } from "lucide-react";
import step1 from "@/assets/demo/step-1-paste.jpg";
import step2 from "@/assets/demo/step-2-leads.jpg";
import step3 from "@/assets/demo/step-3-emails.jpg";
import step4 from "@/assets/demo/step-4-results.jpg";

const steps = [
  {
    n: 1,
    icon: Link2,
    title: "Paste a URL",
    caption: "Echo reads your site and learns your voice, niche, and ideal audience in ~30 seconds.",
    img: step1,
  },
  {
    n: 2,
    icon: Users,
    title: "Find real leads",
    caption: "We surface decision-makers that match your niche — with match scores, not random scrapes.",
    img: step2,
  },
  {
    n: 3,
    icon: Mail,
    title: "AI writes personalized emails",
    caption: "Every email is hand-tuned per lead. Edit, A/B test, or approve in one click.",
    img: step3,
  },
  {
    n: 4,
    icon: BarChart3,
    title: "Track opens, replies & meetings",
    caption: "Live dashboard with real metrics. Pause anytime. Reply Handler drafts replies for you.",
    img: step4,
  },
];

type Props = { onTryDemo: () => void };

export function HomeDemoSection({ onTryDemo }: Props) {
  return (
    <section className="mb-16">
      <div className="text-center mb-8">
        <Badge variant="secondary" className="mb-3">
          <Play className="w-3 h-3 mr-1" /> See it in action
        </Badge>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          From URL to booked replies in minutes
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
          Here's the real flow — no demos, no mocks. Built for niche-first outreach that gets replies.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {steps.map((s) => (
          <Card key={s.n} className="overflow-hidden flex flex-col hover:shadow-md hover:border-primary/30 transition-all">
            <div className="aspect-[4/3] bg-muted/30 border-b border-border relative overflow-hidden">
              <img
                src={s.img}
                alt={s.title}
                loading="lazy"
                width={1024}
                height={768}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md">
                {s.n}
              </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
              <div className="flex items-center gap-2 mb-1.5">
                <s.icon className="w-4 h-4 text-primary" />
                <h3 className="font-semibold text-sm text-foreground">{s.title}</h3>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{s.caption}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex justify-center">
        <Button size="lg" onClick={onTryDemo} className="gap-2 shadow-md">
          Try Fast Mode <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </section>
  );
}
