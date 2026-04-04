import { Link } from "react-router-dom";
import { Zap } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50 mt-auto">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Zap className="w-5 h-5 text-primary" />
              <span className="font-bold text-foreground">Your Echo Agent</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              The affordable AI outreach tool for creators and solo builders.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Product</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li><Link to="/auth" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="text-sm font-semibold text-foreground mb-2">Legal</p>
            <ul className="space-y-1.5 text-sm text-muted-foreground">
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
              <li><Link to="/acceptable-use" className="hover:text-primary transition-colors">Acceptable Use & Anti-Spam</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>© 2026 Your Echo Agent. Built with ❤️ for creators.</p>
          <a
            href="https://x.com/Ladysoleil"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition-colors"
          >
            @Ladysoleil on X
          </a>
        </div>
      </div>
    </footer>
  );
}
