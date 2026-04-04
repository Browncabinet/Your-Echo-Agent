import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/Logo";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";

export default function AcceptableUse() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
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
        <h1 className="text-3xl font-bold text-foreground mb-2">Acceptable Use & Anti-Spam Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: April 4, 2026</p>

        <div className="prose prose-sm max-w-none space-y-6 text-foreground/90">
          <section>
            <h2 className="text-xl font-semibold text-foreground">Why This Matters</h2>
            <p className="text-muted-foreground leading-relaxed">
              Your Echo Agent is a powerful outreach tool, and with great power comes responsibility. We built this platform for creators and solo builders who want to reach the right people with genuine, relevant messages — not for mass spam. This policy exists to protect you, your recipients, and our platform.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">The Golden Rule</h2>
            <p className="text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Only reach out to people who might reasonably want to hear from you.</strong> If the person on the receiving end would think "Why am I getting this?" — it's probably not the right outreach. Think of cold email like a friendly introduction at a networking event, not shouting at strangers on the street.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">What You Must Do</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li><strong className="text-foreground">Comply with the law.</strong> Follow CAN-SPAM (US), GDPR (EU), CASL (Canada), and any other applicable anti-spam laws in your jurisdiction and your recipients' jurisdictions.</li>
              <li><strong className="text-foreground">Include accurate sender info.</strong> Your name, business name, and a valid reply address must be clearly identified in every email.</li>
              <li><strong className="text-foreground">Honor unsubscribe requests immediately.</strong> If someone asks you to stop emailing them, stop. No exceptions, no delays.</li>
              <li><strong className="text-foreground">Use truthful subject lines.</strong> Don't mislead recipients about the content of your email.</li>
              <li><strong className="text-foreground">Keep your lists clean.</strong> Remove bounced emails, unsubscribes, and invalid addresses promptly.</li>
              <li><strong className="text-foreground">Personalize thoughtfully.</strong> AI-generated emails should be relevant to the recipient. Don't mass-blast the same generic template to thousands of people.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">What You Must Not Do</h2>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Send unsolicited bulk email (spam)</li>
              <li>Use purchased, scraped, or harvested email lists from third parties</li>
              <li>Send emails with deceptive headers, subject lines, or content</li>
              <li>Impersonate another person or organization</li>
              <li>Send emails containing malware, phishing links, or harmful content</li>
              <li>Send emails promoting illegal products, services, or activities</li>
              <li>Circumvent sending limits or abuse the platform's infrastructure</li>
              <li>Send to catch-all or role-based addresses (info@, sales@, admin@) en masse</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Sending Limits & Best Practices</h2>
            <p className="text-muted-foreground leading-relaxed">
              We encourage responsible sending volumes. Gmail limits are approximately 500 emails/day for regular accounts and higher for Google Workspace. We recommend:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Start with small batches (20–50 emails) and increase gradually</li>
              <li>Warm up new email accounts before high-volume sending</li>
              <li>Space out your sends — don't blast hundreds of emails in minutes</li>
              <li>Monitor your bounce rate and spam complaints</li>
              <li>If your bounce rate exceeds 5% or spam complaints exceed 0.1%, pause and review your list</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Unsubscribe Handling</h2>
            <p className="text-muted-foreground leading-relaxed">
              Every cold email you send should make it easy for recipients to opt out. Under CAN-SPAM, you must honor opt-out requests within 10 business days. We strongly recommend honoring them immediately. If a recipient replies with "unsubscribe," "stop," "remove me," or similar language — respect it.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">GDPR Compliance</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you're sending emails to people in the European Union, you should be aware of GDPR requirements. For B2B cold outreach, "legitimate interest" may apply, but you must:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Only contact people whose role is relevant to your offer</li>
              <li>Provide a clear way to opt out</li>
              <li>Be transparent about who you are and why you're reaching out</li>
              <li>Stop contacting anyone who objects</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-2">
              We provide the tool — it's your responsibility to ensure your outreach complies with GDPR and other data protection laws.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Enforcement</h2>
            <p className="text-muted-foreground leading-relaxed">
              We take spam seriously. If we detect or receive reports of abusive behavior:
            </p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li><strong className="text-foreground">First offense:</strong> We'll reach out to help you correct the issue</li>
              <li><strong className="text-foreground">Repeated violations:</strong> Your sending privileges may be suspended</li>
              <li><strong className="text-foreground">Severe or intentional abuse:</strong> Your account will be terminated and remaining credits forfeited</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">Reporting Abuse</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you've received unwanted email sent through Your Echo Agent, or if you want to report abuse, please contact us at{" "}
              <a href="https://x.com/Ladysoleil" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@Ladysoleil on X</a>. We investigate all reports promptly.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-foreground">A Final Note</h2>
            <p className="text-muted-foreground leading-relaxed">
              We built Your Echo Agent because we believe in making outreach accessible to solo founders, creators, and small teams. The best outreach is personal, relevant, and respectful. If you approach cold email that way, you'll get better results <em>and</em> keep the ecosystem healthy for everyone.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
