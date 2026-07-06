import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";
import { Logo } from "@/components/Logo";
import { SeoHead } from "@/components/SeoHead";

export default function Privacy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <SeoHead
        title="Privacy Policy — Your Echo Agent"
        description="How Natasha Ulrich (Your Echo Agent) collects, uses, and protects your data. Plain-language privacy notice."
        path="/privacy"
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Privacy Notice</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: July 6, 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold text-foreground">Who We Are</h2>
            <p className="text-muted-foreground leading-relaxed">
              This service, <strong className="text-foreground">Your Echo Agent</strong>, is operated by <strong className="text-foreground">Natasha Ulrich</strong> ("we," "us," or "our"), the sole proprietor of the business. Natasha Ulrich is the <strong className="text-foreground">data controller</strong> responsible for the personal data described in this notice. You can contact us at <a href="mailto:support@yourechoagent.com" className="text-primary hover:underline">support@yourechoagent.com</a>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed"><strong className="text-foreground">Account information:</strong> Name, email address, profile photo, and Google account identifier when you sign in with Google.</p>
            <p className="text-muted-foreground leading-relaxed"><strong className="text-foreground">Campaign data:</strong> Websites you scrape, leads you discover, emails you write and send, and campaign performance metrics (opens, clicks, replies).</p>
            <p className="text-muted-foreground leading-relaxed"><strong className="text-foreground">Email settings:</strong> If you connect Gmail via SMTP, we store your sending address, SMTP credentials (encrypted), and sending preferences.</p>
            <p className="text-muted-foreground leading-relaxed"><strong className="text-foreground">Order & billing data:</strong> Payments are processed by our reseller Paddle (see "Data Sharing" below). We receive and store transaction records — order ID, plan or top-up purchased, amount, currency, subscription status, and the Paddle customer ID — but we do <strong className="text-foreground">not</strong> receive or store your full card number, CVC, or bank details. Those are collected and held by Paddle.</p>
            <p className="text-muted-foreground leading-relaxed"><strong className="text-foreground">Support communications:</strong> Any messages you send us and our responses.</p>
            <p className="text-muted-foreground leading-relaxed"><strong className="text-foreground">Usage & device data:</strong> IP address, device/browser type, pages visited, and feature usage, collected via essential cookies and server logs.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Purposes & Legal Basis</h2>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong className="text-foreground">Provide the service</strong> (account, campaigns, sending, tracking, credit balance) — <em>performance of a contract</em> with you.</li>
              <li><strong className="text-foreground">Take payment and manage subscriptions / top-ups</strong> — <em>performance of a contract</em>.</li>
              <li><strong className="text-foreground">Security, abuse prevention, and fraud detection</strong> (rate-limiting, log review, deliverability safeguards) — <em>legitimate interests</em>.</li>
              <li><strong className="text-foreground">Product improvement and analytics</strong> (aggregated usage) — <em>legitimate interests</em>.</li>
              <li><strong className="text-foreground">Customer support</strong> — <em>legitimate interests</em> / <em>performance of a contract</em>.</li>
              <li><strong className="text-foreground">Product updates by email</strong> — <em>legitimate interests</em>, with an opt-out in every message.</li>
              <li><strong className="text-foreground">Legal and tax obligations</strong> (record-keeping, responding to lawful requests) — <em>legal obligation</em>.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Data Sharing</h2>
            <p className="text-muted-foreground leading-relaxed">
              We do <strong className="text-foreground">not</strong> sell your personal data. We share information only with the following categories of recipients:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong className="text-foreground">Paddle.com Market Ltd. (Merchant of Record)</strong> — processes all payments, subscriptions, invoicing, sales-tax compliance, chargebacks, and refunds. Paddle appears as the merchant on your card statement. See <a href="https://www.paddle.com/legal/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Paddle's Privacy Notice</a>.</li>
              <li><strong className="text-foreground">Hosting and infrastructure providers</strong> — for application hosting, database, edge functions, and storage.</li>
              <li><strong className="text-foreground">Google</strong> — for authentication when you choose Google sign-in.</li>
              <li><strong className="text-foreground">AI model providers</strong> — to generate personalized email drafts. Prompts may include lead context you provide; we do not send full contact lists for model training.</li>
              <li><strong className="text-foreground">Professional advisers</strong> (legal, accounting) — where reasonably necessary.</li>
              <li><strong className="text-foreground">Authorities</strong> — where required to comply with applicable law or valid legal process.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">International Transfers</h2>
            <p className="text-muted-foreground leading-relaxed">
              Some of our service providers (including Paddle and our hosting/AI providers) may process data outside your country of residence, including in the United States. Where personal data is transferred out of the UK or EEA, we rely on appropriate safeguards such as the European Commission's Standard Contractual Clauses or adequacy decisions.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We keep personal data only for as long as we need it for the purposes above. In practice:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong className="text-foreground">Account and campaign data:</strong> for the life of your account, and up to 30 days after account deletion to allow recovery, before permanent deletion or anonymisation.</li>
              <li><strong className="text-foreground">Order and billing records:</strong> retained for up to 7 years to meet tax and accounting obligations.</li>
              <li><strong className="text-foreground">Support communications:</strong> up to 2 years after the last message.</li>
              <li><strong className="text-foreground">Server logs and security data:</strong> up to 90 days.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed">
              After these periods, data is deleted or anonymised.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              Depending on where you live, you have rights to access, correct, delete, restrict, or port your personal data, to object to certain processing, and to withdraw consent where processing is based on consent. UK/EEA users also have the right to lodge a complaint with their supervisory authority. To exercise any of these rights, email <a href="mailto:support@yourechoagent.com" className="text-primary hover:underline">support@yourechoagent.com</a>; we aim to respond within one month.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use industry-standard technical and organisational measures including TLS in transit, encrypted secrets, role-based access, and row-level security on our database. No system is 100% secure, but we take reasonable steps to protect your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Cookies</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use <strong className="text-foreground">essential cookies</strong> to keep you signed in and remember preferences, and a small amount of first-party analytics to understand feature usage. We do not run third-party advertising cookies. You can manage cookies through your browser settings.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Email Tracking</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you send campaigns, we insert a small tracking pixel and wrap links to measure opens and clicks. This data is only visible to you (the sender). Recipients are not tracked across the web.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Changes to This Notice</h2>
            <p className="text-muted-foreground leading-relaxed">
              We may update this notice from time to time. If we make material changes, we'll notify you by email or in-app notice. The "last updated" date above always reflects the current version.
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
