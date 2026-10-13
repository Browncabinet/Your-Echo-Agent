import { useLocation } from "react-router-dom";
import { SeoHead } from "@/components/SeoHead";

// Pages with their own SeoHead retain ownership of their metadata and JSON-LD.
const pageOwnedPaths = new Set([
  "/", "/pricing", "/about", "/privacy", "/terms", "/refund", "/acceptable-use",
  "/for-agents", "/for-agents/signup", "/for-agents/login", "/for-agents/docs",
  "/for-agents/quickstart", "/for-agents/register", "/for-agents/discover",
  "/for-agents/radar", "/settings/mcp", "/gallery", "/referrals",
  "/free-event-outreach-email-generator",
]);

const routeMetadata: Record<string, { title: string; description: string }> = {
  "/auth": { title: "Sign in with Google — Your Echo", description: "Sign in to Your Echo with Google to discover relevant events, draft warm outreach, and manage your agent account." },
  "/for-agents/billing": { title: "Agent Billing & Prepaid Balance — Your Echo", description: "Manage your Your Echo prepaid balance, email packs, and billing for A2A and MCP outreach jobs." },
  "/for-agents/dashboard": { title: "Agent Dashboard & Jobs — Your Echo", description: "Manage your Your Echo API keys, monitor outreach jobs, and review results from your A2A and MCP agents." },
  "/checkout/return": { title: "Checkout Confirmation — Your Echo", description: "Review your Your Echo checkout status and return to your account after purchasing emails or adding prepaid funds." },
  "/dev/a2a-sim": { title: "A2A Request Simulator — Your Echo", description: "Test Your Echo agent requests and inspect A2A responses in the authenticated request simulator." },
  "/submissions": { title: "Agent Registry Submissions — Your Echo", description: "Prepare Your Echo agent registry submissions and review marketplace listing materials." },
  "/.lovable/oauth/consent": { title: "Authorize Agent Access — Your Echo", description: "Review and authorize an AI assistant's requested access to your Your Echo account through MCP." },
  "/signup": { title: "Create an Agent Account — Your Echo", description: "Continue to Your Echo developer signup to create an account and get your agent API key." },
  "/login": { title: "Agent Account Login — Your Echo", description: "Continue to Your Echo partner login to access your agent account." },
  "/dashboard": { title: "Open Your Agent Dashboard — Your Echo", description: "Continue to your Your Echo dashboard to manage API keys and outreach jobs." },
  "/for-agents/community-radar": { title: "Open Community Radar — Your Echo", description: "Continue to Your Echo Community Radar to discover relevant events, podcasts, and communities." },
  "/examples": { title: "Browse Agent Examples — Your Echo", description: "Continue to the Your Echo examples gallery for A2A workflows and copy-ready MCP configurations." },
};

export function RouteSeoHead() {
  const { pathname } = useLocation();
  const path = pathname.replace(/\/+$/, "") || "/";
  if (pageOwnedPaths.has(path)) return null;
  const metadata = routeMetadata[path] ?? {
    title: "Page Not Found — Your Echo",
    description: "This page could not be found on Your Echo. Return home to explore A2A and MCP outreach tools.",
  };
  return <SeoHead {...metadata} path={path} />;
}