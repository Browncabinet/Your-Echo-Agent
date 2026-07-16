import { Quote } from "lucide-react";

const testimonials = [
  {
    quote:
      "Your Echo found three niche founder podcasts I'd never heard of in an afternoon. Two hosts replied to the drafts almost verbatim.",
    name: "Maya Chen",
    role: "Founder, Ledgerloop",
  },
  {
    quote:
      "The event discovery is the unlock. We stopped blasting scraped lists and started showing up in rooms where our buyers already live.",
    name: "Devon Alvarez",
    role: "Head of Growth, NorthKit",
  },
  {
    quote:
      "Reply Handler alone paid for the year. Every response comes pre-classified with a draft I usually just tweak and send.",
    name: "Priya Ramanathan",
    role: "Fractional CMO",
  },
  {
    quote:
      "Feels like hiring a very persistent PR intern who never sleeps and actually reads the podcast before pitching.",
    name: "Jonas Weber",
    role: "Solo founder, Trailhead Analytics",
  },
  {
    quote:
      "We hired the Press Pitcher agent over A2A from our own orchestrator. It landed us in two industry newsletters in week one.",
    name: "Ana Beltrán",
    role: "Comms Lead, Meridian Robotics",
  },
  {
    quote:
      "Way warmer than cold email. The comment drafts on community threads got us invited to speak at a conference.",
    name: "Ryan Okafor",
    role: "Cofounder, Coastline DTC",
  },
];

// Duplicate for seamless loop
const loop = [...testimonials, ...testimonials];

export function TestimonialsMarquee() {
  return (
    <section
      aria-labelledby="testimonials-heading"
      className="border-t border-border/60 bg-card/30 py-16 overflow-hidden"
    >
      <div className="container max-w-6xl mx-auto px-4 mb-10 text-center">
        <h2
          id="testimonials-heading"
          className="text-2xl sm:text-3xl font-semibold tracking-tight"
        >
          Loved by founders, marketers, and agents
        </h2>
        <p className="text-muted-foreground mt-2 text-sm">
          Real teams using Your Echo for event discovery and warm outreach.
        </p>
      </div>

      <div
        className="relative group"
        style={{
          maskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          WebkitMaskImage:
            "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="flex gap-4 w-max animate-[marquee_45s_linear_infinite] group-hover:[animation-play-state:paused]">
          {loop.map((t, i) => (
            <figure
              key={i}
              className="w-[320px] sm:w-[360px] shrink-0 rounded-xl border border-border bg-card p-5 flex flex-col justify-between"
            >
              <Quote className="w-5 h-5 text-primary/70 mb-3" aria-hidden />
              <blockquote className="text-sm leading-relaxed text-foreground/90">
                {t.quote}
              </blockquote>
              <figcaption className="mt-4 pt-4 border-t border-border/60">
                <div className="text-sm font-medium">{t.name}</div>
                <div className="text-xs text-muted-foreground">{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @media (prefers-reduced-motion: reduce) {
          .animate-\\[marquee_45s_linear_infinite\\] { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
