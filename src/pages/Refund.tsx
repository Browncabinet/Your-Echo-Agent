import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { SeoHead } from "@/components/SeoHead";

export default function Refund() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SeoHead
        title="Refund Policy — Your Echo Agent"
        description="30-day money-back guarantee on subscriptions and one-time email top-up packs."
        path="/refund"
      />

      <header className="border-b bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/">
            <Logo />
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Refund Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: July 6, 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold text-foreground">30-Day Money-Back Guarantee</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Your Echo Agent</strong>, operated by <strong className="text-foreground">Natasha Ulrich</strong>, offers a <strong className="text-foreground">30-day money-back guarantee</strong> on all subscription plans and one-time email top-up packs. If you're not satisfied with your purchase, you can request a full refund within 30 days of your order date.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">How to Request a Refund</h2>
            <p className="text-muted-foreground leading-relaxed">
              Email us at <a href="mailto:support@yourechoagent.com" className="text-primary hover:underline">support@yourechoagent.com</a> with your order confirmation or the email address you used at checkout. We typically respond within 1–2 business days.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Approved refunds are returned to the original payment method via our payment processor, Stripe. Timing depends on your bank or card issuer — typically 5–10 business days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Cancellations</h2>
            <p className="text-muted-foreground leading-relaxed">
              You can cancel a subscription at any time from your account's billing page. When you cancel, your subscription remains active until the end of the current billing period and then stops renewing. You will not be charged again.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">After the 30-Day Window</h2>
            <p className="text-muted-foreground leading-relaxed">
              After 30 days, refunds are considered on a case-by-case basis. If you experience a billing error or a technical issue that prevented you from using the service, contact us — we'll do our best to make it right.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Natasha Ulrich, operator of Your Echo Agent —{" "}
              <a href="mailto:support@yourechoagent.com" className="text-primary hover:underline">support@yourechoagent.com</a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
