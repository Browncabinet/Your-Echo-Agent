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
        description="30-day money-back guarantee. Refunds are processed by our Merchant of Record, Paddle, via paddle.net."
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
              Refunds are processed by our reseller and Merchant of Record, <strong className="text-foreground">Paddle</strong>. To request a refund:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Visit <a href="https://paddle.net" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">paddle.net</a> and enter the email you used at checkout, or</li>
              <li>Email us at <a href="mailto:support@yourechoagent.com" className="text-primary hover:underline">support@yourechoagent.com</a> with your order ID and we'll help you through the process.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              Approved refunds are returned to the original payment method. Timing depends on your bank or card issuer — typically 5–10 business days.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Cancellations</h2>
            <p className="text-muted-foreground leading-relaxed">
              You can cancel a subscription at any time via the customer portal linked from your account, or via paddle.net. When you cancel, your subscription will remain active until the end of the current billing period and then stop renewing.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">After the 30-Day Window</h2>
            <p className="text-muted-foreground leading-relaxed">
              After 30 days, refunds are handled at Paddle's discretion in line with <a href="https://www.paddle.com/legal/refund-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Paddle's Refund Policy</a>. If you experience a billing error or a technical issue that prevented you from using the service, contact us — we'll do our best to make it right.
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
