import { Link } from "react-router-dom";

export function Footer() {
  return (
    <footer className="relative z-30 mt-auto border-t border-border bg-card/95 shadow-sm backdrop-blur-sm">
      <div className="container max-w-5xl mx-auto px-4 py-6 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
          <Link to="/for-agents/docs" className="hover:text-primary transition-colors">Docs</Link>
          <Link to="/about" className="hover:text-primary transition-colors">About</Link>
          <a href="https://x.com/ladysoleil33" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">@ladysoleil33</a>
          <a href="mailto:support@yourechoagent.com" className="hover:text-primary transition-colors">Support</a>
          <Link to="/privacy" className="hover:text-primary transition-colors">Privacy & Terms</Link>
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span>Listed on</span>
          <a href="https://glama.ai/mcp/servers/@browncabinet/yourechoagent-mcp" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline underline-offset-2">Glama.ai</a>
          <span aria-hidden>·</span>
          <a href="https://smithery.ai/server/@browncabinet/yourechoagent-mcp" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors underline underline-offset-2">Smithery</a>
        </div>
        <p className="mt-2 text-xs text-muted-foreground">
          © 2026 Echo Agent
        </p>
      </div>
    </footer>
  );
}
