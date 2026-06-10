import { Link } from "react-router-dom";
import { Logo } from "@/components/Logo";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-6">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <div className="mb-2">
              <Logo size="sm" />
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Niche-first AI outreach for founders, agencies, and AI agents. Pay weekly, cancel anytime.
            </p>
          </div>

          {/* Product */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Product</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
              <li><Link to="/about" className="hover:text-primary transition-colors">About</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Resources</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li><Link to="/for-agents/docs" className="hover:text-primary transition-colors">Docs</Link></li>
              <li><a href="https://status.yourechoagent.com" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Status</a></li>
              <li><a href="mailto:support@yourechoagent.com" className="hover:text-primary transition-colors">Support</a></li>
              <li><a href="https://x.com/Ladysoleil" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Twitter / X</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Legal</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/acceptable-use" className="hover:text-primary transition-colors">Acceptable Use</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            <span>© 2026 Your Echo Agent</span>
            <span aria-hidden>•</span>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <span aria-hidden>•</span>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
            <span aria-hidden>•</span>
            <Link to="/acceptable-use" className="hover:text-primary transition-colors">Acceptable Use</Link>
          </p>
          <a
            href="https://x.com/ladysoleil33"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            Built with love from @ladysoleil33 on X
          </a>
        </div>
      </div>
    </footer>
  );
}
