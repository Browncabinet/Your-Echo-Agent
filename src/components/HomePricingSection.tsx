import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const payAsYouGo = [
  { price: 9, messages: 250, label: "Test Pack", highlight: false },
  { price: 25, messages: 1000, label: "Best for Starting", highlight: true },
  { price: 49, messages: 2500, label: null, highlight: false },
];

const weeklyPlans = [
  { price: 39, period: "week", messages: "1,000 messages", features: ["1 Echo Agent", "Niche outreach", "Reply handling"] },
];

const monthlyPlans = [
  { name: "Starter", price: 29, messages: "500 messages", features: ["1 Echo Agent", "Basic analytics", "Community + email"] },
  { name: "Pro", price: 59, messages: "2,000 messages", features: ["3 Echo Agents", "A2A marketplace", "Priority support"], highlight: true },
  { name: "Scale", price: 119, messages: "6,000 messages", features: ["Unlimited agents", "Custom training", "Dedicated success"] },
];

export function HomePricingSection() {
  const navigate = useNavigate();
  return (
    <section className="mb-16 scroll-mt-20" id="pricing">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground">
          Start Testing with No Pressure
        </h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-xl mx-auto">
          Start small with Pay-As-You-Go. Upgrade when you see replies and booked calls.
        </p>
      </div>

      {/* Pay-As-You-Go Packs */}
      <div className="mb-10">
        <h3 className="text-sm font-semibold text-foreground mb-3 text-center">Pay-As-You-Go Packs</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {payAsYouGo.map((p) => (
            <Card
              key={p.price}
              className={`p-5 flex flex-col items-center text-center ${
                p.highlight ? "border-primary shadow-lg ring-1 ring-primary/30" : ""
              }`}
            >
              {p.highlight && <Badge className="mb-2">Best Starter Pack</Badge>}
              <div className="text-3xl font-bold text-foreground">${p.price}</div>
              <p className="text-sm text-muted-foreground mt-1">{p.messages.toLocaleString()} messages</p>
              {p.label && (
                <p className="text-xs font-medium text-primary mt-1">{p.label}</p>
              )}
              <Button
                variant={p.highlight ? "default" : "outline"}
                onClick={() => navigate("/pricing")}
                className="mt-4 w-full"
              >
                Buy Pack <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Card>
          ))}
        </div>
      </div>

      {/* Weekly Plans */}
      <div className="mb-10">
        <h3 className="text-sm font-semibold text-foreground mb-3 text-center">Weekly Plans</h3>
        <div className="max-w-sm mx-auto">
          <Card className="p-5 flex flex-col items-center text-center border-dashed">
            <div className="text-3xl font-bold text-foreground">${weeklyPlans[0].price}</div>
            <p className="text-sm text-muted-foreground mt-1">per week</p>
            <p className="text-xs text-muted-foreground mt-1">{weeklyPlans[0].messages}</p>
            <ul className="mt-3 space-y-1">
              {weeklyPlans[0].features.map((f) => (
                <li key={f} className="flex items-center gap-1.5 text-xs text-foreground">
                  <Check className="w-3.5 h-3.5 text-primary" /> {f}
                </li>
              ))}
            </ul>
            <Button variant="outline" onClick={() => navigate("/pricing")} className="mt-4 w-full">
              Choose Weekly
            </Button>
          </Card>
        </div>
      </div>

      {/* Monthly Plans */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3 text-center">Monthly Plans</h3>
        <div className="grid sm:grid-cols-3 gap-4">
          {monthlyPlans.map((t) => (
            <Card
              key={t.name}
              className={`p-5 flex flex-col ${
                t.highlight ? "border-primary shadow-lg ring-1 ring-primary/30" : ""
              }`}
            >
              {t.highlight && <Badge className="self-start mb-2">Most Popular</Badge>}
              <h4 className="text-lg font-bold text-foreground">{t.name}</h4>
              <div className="mt-2 mb-1">
                <span className="text-3xl font-bold text-foreground">${t.price}</span>
                <span className="text-muted-foreground text-sm">/mo</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">{t.messages}</p>
              <ul className="space-y-1.5 mb-5 flex-1">
                {t.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={t.highlight ? "default" : "outline"}
                onClick={() => navigate("/pricing")}
                className="w-full"
              >
                Choose {t.name}
              </Button>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
