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
        description="Terms governing the use of Your Echo Agent, operated by Natasha Ulrich. Covers acceptable use, subscriptions, and billing."
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
        <p className="text-sm text-muted-foreground mb-8">Last updated: July 6, 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold text-foreground">Who You're Contracting With</h2>
            <p className="text-muted-foreground leading-relaxed">
              These Terms of Service ("Terms") are a binding agreement between you and <strong className="text-foreground">Natasha Ulrich</strong>, sole proprietor, trading as <strong className="text-foreground">Your Echo Agent</strong> ("we," "us," or "our"). By creating an account or using the service you agree to these Terms; if you don't agree, please don't use the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">What We Provide</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your Echo Agent is an AI-powered outreach platform that helps you find leads, draft personalized cold emails, send campaigns, and track results. We provide the tool — you're responsible for how you use it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Your Account</h2>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>You must provide accurate information and keep it up to date.</li>
              <li>You're responsible for all activity under your account and for keeping your credentials confidential.</li>
              <li>If you sign up on behalf of an organization, you confirm you have authority to bind it.</li>
              <li>You must be at least 18 years old to use the service.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Payments, Subscriptions & Billing</h2>
            <p className="text-muted-foreground leading-relaxed">
              Payments are processed on our behalf by <strong className="text-foreground">Stripe</strong>, a PCI-DSS Level 1 payment processor. Natasha Ulrich, trading as Your Echo Agent, remains the seller of record for your purchase. Card details are collected and stored by Stripe; we never see or store your full card number.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Subscription plans (currently weekly) renew automatically at the end of each billing period until you cancel. One-time top-up packs are billed once and add non-expiring email credits to your balance. Prices are in US dollars unless otherwise stated. You are responsible for any applicable taxes based on your jurisdiction, except where we are required to collect them.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You can update payment methods, download invoices, and cancel subscriptions from the billing page inside your account. See our <Link to="/refund" className="text-primary hover:underline">Refund Policy</Link> for our 30-day money-back guarantee.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Acceptable Use</h2>
            <p className="text-muted-foreground leading-relaxed">
              You agree to use Your Echo Agent lawfully and in compliance with anti-spam laws including CAN-SPAM, CASL, and GDPR. You must not:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Use the service for unlawful, harassing, deceptive, or fraudulent purposes.</li>
              <li>Send spam, phishing, malware, or content infringing third-party rights.</li>
              <li>Attempt to probe, scan, reverse-engineer, or otherwise interfere with the security of the service.</li>
              <li>Resell, redistribute, or scrape the service, or circumvent technical limits or rate limits.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              See our{" "}
              <Link to="/acceptable-use" className="text-primary hover:underline">Acceptable Use & Anti-Spam Policy</Link>{" "}
              for detailed guidelines.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              The service, including all software, documentation, and branding, is owned by Natasha Ulrich and protected by intellectual-property laws. We grant you a limited, non-exclusive, non-transferable right to use the service within your chosen plan. You own the content you create — your campaigns, email copy, and lead lists — and you grant us a limited licence to host and process that content solely to provide the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">AI-Generated Content</h2>
            <p className="text-muted-foreground leading-relaxed">
              You are responsible for your prompts, the outputs you choose to send, verifying accuracy, and having the rights to any content you provide as input. AI outputs may be inaccurate and are not a substitute for professional advice. We may filter, refuse, or remove outputs that violate these Terms or the Acceptable Use Policy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Service Availability</h2>
            <p className="text-muted-foreground leading-relaxed">
              We aim for high uptime but do not guarantee the service will always be available, uninterrupted, or error-free. We may perform maintenance, updates, or experience outages, and will make reasonable efforts to communicate planned downtime.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Warranty Disclaimer</h2>
            <p className="text-muted-foreground leading-relaxed">
              The service is provided "as is" and "as available." To the fullest extent permitted by law, we disclaim all implied warranties, including merchantability, fitness for a particular purpose, and non-infringement.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by law, we are not liable for indirect, incidental, special, consequential, or punitive damages, or for lost profits, revenue, data, or goodwill. Our aggregate liability for any claim arising out of or relating to the service is limited to the fees you paid us in the 12 months before the event giving rise to the claim. Nothing in these Terms limits liability that cannot be excluded by law (including for fraud or death/personal injury caused by negligence).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Suspension & Termination</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may suspend or terminate your access if you materially breach these Terms or the Acceptable Use Policy, fail to pay, pose a security or fraud risk, or repeatedly or seriously violate policy. You may cancel your subscription at any time from the billing page in your account. On termination, your right to use the service ends; you may request an export of your data within 30 days, after which it may be deleted.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Changes to These Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update these Terms as the product evolves. We'll notify you of material changes by email or in-app notice. Continued use after changes constitutes acceptance.
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
