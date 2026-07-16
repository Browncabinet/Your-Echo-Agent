import { Link } from "react-router-dom";
import { Bot } from "lucide-react";

export function Footer() {
  return (
    <footer className="relative z-30 mt-auto border-t border-border bg-card/95 shadow-sm backdrop-blur-sm">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="inline-flex items-center gap-1.5 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            <Bot className="w-3.5 h-3.5" />
            Built for multi-agent systems · A2A 0.3.0 · MCP · OpenAPI 3.1
          </div>
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            <Link to="/for-agents" className="hover:text-primary transition-colors">For Agents</Link>
            <Link to="/gallery" className="hover:text-primary transition-colors">Examples</Link>
            <Link to="/for-agents/docs" className="hover:text-primary transition-colors">Docs</Link>
            <Link to="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <a href="/.well-known/agent-card.json" className="hover:text-primary transition-colors">Agent Card</a>
            <a href="/.well-known/mcp/server-card.json" className="hover:text-primary transition-colors">MCP Card</a>
            <a href="https://glama.ai" target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors">Glama</a>
            <a href="mailto:support@yourechoagent.com" className="hover:text-primary transition-colors">Support</a>
            <Link to="/privacy" className="hover:text-primary transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-primary transition-colors">Terms</Link>
          </div>
          <p className="text-xs text-muted-foreground">
            © 2026 Your Echo · The A2A-native PR &amp; Outreach Agent
          </p>
        </div>
      </div>
    </footer>
  );
}
