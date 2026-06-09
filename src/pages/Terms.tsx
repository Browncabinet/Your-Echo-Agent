import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { SeoHead } from "@/components/SeoHead";

export default function Terms() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SeoHead
        title="Terms of Service — Your Echo Agent"
        description="Terms governing the use of Your Echo Agent's outreach platform, subscriptions, refunds, and acceptable use."
        path="/terms"
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Terms of Service</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: April 4, 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold text-foreground">Agreement to Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By using Your Echo Agent, you agree to these terms. If you don't agree, please don't use the service. We've tried to keep these terms clear and fair — no gotchas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">What We Provide</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your Echo Agent is an AI-powered outreach platform that helps you find leads, write personalized cold emails, send campaigns, and track results. We provide the tool — you're responsible for how you use it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Your Account</h2>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>You must provide accurate information when signing up</li>
              <li>You're responsible for all activity under your account</li>
              <li>Keep your account credentials secure</li>
              <li>You must be at least 18 years old to use the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Email Packs & Payments</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your Echo Agent uses a pay-as-you-go system. Email packs are purchased through Stripe and never expire. Each email sent uses one from your balance.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              All purchases are final. Email packs are non-refundable and non-transferable. If you believe there was a billing error, contact us and we'll look into it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to use Your Echo Agent responsibly and in compliance with all applicable laws, including CAN-SPAM, GDPR, and other anti-spam regulations. See our{" "}
              <Link to="/acceptable-use" className="text-primary hover:underline">Acceptable Use & Anti-Spam Policy</Link>{" "}
              for detailed guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Your Content & Data</h2>
            <p className="text-muted-foreground leading-relaxed">
              You own the content you create on the platform — your campaigns, email copy, and lead lists. We don't claim any ownership over your data. We may use anonymized, aggregated usage data to improve the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We aim for high uptime but can't guarantee the service will always be available. We may perform maintenance, updates, or experience outages. We'll do our best to communicate any planned downtime in advance.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your Echo Agent is provided "as is." We do our best to deliver a reliable product, but we're not liable for:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Emails that don't get delivered or end up in spam folders</li>
              <li>The accuracy of AI-generated email content</li>
              <li>Leads that turn out to be incorrect or outdated</li>
              <li>Any consequences of how you use the outreach tool</li>
              <li>Lost revenue or business opportunities</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-2">
              Our total liability is limited to the amount you've paid us in the last 12 months.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Account Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We reserve the right to suspend or terminate accounts that violate these terms or our Acceptable Use Policy. If we terminate your account, any remaining emails will be forfeited. You can delete your account at any time.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Changes to These Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these terms as the product evolves. We'll notify you of material changes via email or in-app notice. Continued use after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions about these terms? Reach out at{" "}
              <a href="https://x.com/Ladysoleil" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@Ladysoleil on X</a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
