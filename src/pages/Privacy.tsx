import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b bg-card">
        <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-primary" />
            <span className="text-lg font-bold text-foreground">Your Echo Agent</span>
          </Link>
          <Link to="/">
            <Button variant="ghost" size="sm"><ArrowLeft className="w-4 h-4 mr-1" /> Back</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1 container max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: April 4, 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold text-foreground">What This Policy Covers</h2>
            <p className="text-muted-foreground leading-relaxed">
              This Privacy Policy explains how Your Echo Agent ("we," "us," or "our") collects, uses, and protects your information when you use our platform. We believe in being straightforward — no hidden data practices, no surprises.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed"><strong className="text-foreground">Account information:</strong> When you sign in with Google, we receive your name, email address, and profile photo. We use this to create and manage your account.</p>
            <p className="text-muted-foreground leading-relaxed"><strong className="text-foreground">Campaign data:</strong> The websites you scrape, leads you discover, emails you write and send, and campaign performance metrics (opens, clicks, replies). This data belongs to you.</p>
            <p className="text-muted-foreground leading-relaxed"><strong className="text-foreground">Email settings:</strong> If you connect Gmail via SMTP, we store your email address, SMTP credentials, and sending preferences. Credentials are stored securely and never shared.</p>
            <p className="text-muted-foreground leading-relaxed"><strong className="text-foreground">Payment information:</strong> Credit purchases are processed by Stripe. We never see or store your full credit card number. We only store transaction records (amount, credits added, session ID).</p>
            <p className="text-muted-foreground leading-relaxed"><strong className="text-foreground">Usage data:</strong> Basic analytics like page views and feature usage to help us improve the product.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>To provide and improve the Your Echo Agent platform</li>
              <li>To send campaigns on your behalf through your connected email</li>
              <li>To track email opens, clicks, and replies for your campaigns</li>
              <li>To process payments and manage your credit balance</li>
              <li>To send you important product updates (you can opt out anytime)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do <strong className="text-foreground">not</strong> sell your data. We share information only with service providers that help us run the platform:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong className="text-foreground">Stripe</strong> — for payment processing</li>
              <li><strong className="text-foreground">Google</strong> — for authentication</li>
              <li><strong className="text-foreground">AI providers</strong> — to generate personalized emails (no personally identifiable lead data is stored by AI providers)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Your Data Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              You can request a copy of your data, ask us to correct it, or delete your account at any time. If you're in the EU, you have additional rights under GDPR including the right to data portability and the right to object to processing. Contact us and we'll handle it promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use industry-standard encryption, secure databases with row-level security, and follow best practices to protect your information. No system is 100% secure, but we take reasonable measures to safeguard your data.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use essential cookies to keep you signed in and remember your preferences. We do not use third-party advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Email Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you send campaigns, we insert a small tracking pixel and wrap links to measure opens and clicks. This data is only visible to you (the sender) and is used to provide campaign analytics. Recipients are not tracked across the web.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this policy from time to time. If we make significant changes, we'll notify you via email or an in-app notice. The "last updated" date at the top will always reflect the most recent version.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              Questions or concerns? Reach out to us at{" "}
              <a href="https://x.com/Ladysoleil" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@Ladysoleil on X</a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
