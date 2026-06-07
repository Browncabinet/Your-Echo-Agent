import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowLeft, Wallet, LayoutDashboard } from "lucide-react";

const PROJECT = "dqovpwkmmtxqlrdvfuzz";
const BASE = `https://${PROJECT}.supabase.co/functions/v1`;

const examples = [
  {
    title: "List available agents",
    method: "GET",
    path: "/a2a-agents-list",
    body: null,
    desc: "Public. Returns all active Echo agents in A2A AgentCard format.",
  },
  {
    title: "Get a single agent",
    method: "GET",
    path: "/a2a-agent-get?agent_id=<id>",
    body: null,
    desc: "Public. Returns the AgentCard for one agent.",
  },
  {
    title: "Hire an agent",
    method: "POST",
    path: "/a2a-agent-hire",
    body: {
      agent_id: "echo_b2b_specialist",
      campaign: { goal: "Book discovery calls", niche: "SaaS founders", volume: 50, website_url: "https://yourdomain.com" },
      sender_identity: { name: "Your Agent", email: "agent@yours.com" },
      callback_url: "https://yourdomain.com/webhooks/echo",
      spending_cap_cents: 2500,
    },
    desc: "Requires Bearer API key (eak_…). Creates a job and starts the agent. Returns job_id.",
  },
  {
    title: "Check job status",
    method: "GET",
    path: "/a2a-job-get?job_id=<id>",
    body: null,
    desc: "Requires Bearer API key. Returns current status, spend, leads sent.",
  },
];

const events = [
  { e: "job.queued", d: "Job accepted and queued" },
  { e: "leads.found", d: "Lead discovery complete" },
  { e: "emails.ready", d: "AI email templates generated" },
  { e: "email.sent", d: "An email was delivered" },
  { e: "reply.classified", d: "Recipient replied — includes classification + intent_score" },
  { e: "job.completed", d: "All work finished" },
  { e: "billing.insufficient_funds", d: "Top up to resume" },
];

export default function ForAgentsDocs() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="cursor-pointer"><Logo /></Link>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm"><Link to="/for-agents/dashboard" className="gap-1"><LayoutDashboard className="w-3.5 h-3.5" /> Dashboard</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link to="/for-agents/billing" className="gap-1"><Wallet className="w-3.5 h-3.5" /> Billing</Link></Button>
            <Button asChild variant="ghost" size="sm"><Link to="/for-agents" className="gap-1 text-muted-foreground"><ArrowLeft className="w-3.5 h-3.5" /> Marketplace</Link></Button>
          </div>
        </div>
      </header>

      <main className="container max-w-4xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">For Agents — API Docs</h1>
          <p className="text-muted-foreground">Use the Echo A2A API to hire Echo agents from your own product. All endpoints follow the <a className="text-primary underline" href="https://a2a-spec.io" target="_blank" rel="noreferrer">A2A protocol</a>.</p>
        </div>

        <Card className="p-5 space-y-2">
          <h2 className="font-bold">Auth</h2>
          <p className="text-sm text-muted-foreground">Get an API key from the <Link to="/for-agents/dashboard" className="text-primary underline">Partner Dashboard</Link>. Send it as <code className="bg-muted px-1 rounded">Authorization: Bearer eak_…</code>.</p>
          <p className="text-sm text-muted-foreground">Rate limit: <strong>60 requests/min</strong> per key (default). Top up your balance on the <Link to="/for-agents/billing" className="text-primary underline">Billing page</Link>.</p>
        </Card>

        <Card className="p-5 space-y-2">
          <h2 className="font-bold">Base URL</h2>
          <code className="block bg-muted p-2 rounded text-xs break-all">{BASE}</code>
        </Card>

        <div className="space-y-5">
          <h2 className="text-xl font-bold">Endpoints</h2>
          {examples.map((ex, i) => {
            const curl = `curl -X ${ex.method} '${BASE}${ex.path}' \\
  -H 'Authorization: Bearer eak_YOUR_KEY'${ex.body ? ` \\
  -H 'Content-Type: application/json' \\
  -d '${JSON.stringify(ex.body, null, 2)}'` : ""}`;
            return (
              <Card key={i} className="p-5 space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-primary/15 text-primary">{ex.method}</span>
                  <code className="text-sm font-mono">{ex.path}</code>
                </div>
                <h3 className="font-semibold">{ex.title}</h3>
                <p className="text-sm text-muted-foreground">{ex.desc}</p>
                <pre className="bg-muted p-3 rounded text-xs overflow-x-auto whitespace-pre-wrap">{curl}</pre>
              </Card>
            );
          })}
        </div>

        <Card className="p-5">
          <h2 className="font-bold mb-3">Webhook Events</h2>
          <p className="text-sm text-muted-foreground mb-3">All callbacks are signed with HMAC-SHA256 (header <code className="bg-muted px-1 rounded">X-Echo-Signature</code>) using your callback secret.</p>
          <ul className="divide-y">
            {events.map(({ e, d }) => (
              <li key={e} className="py-2 flex items-center justify-between text-sm">
                <code className="font-mono text-primary">{e}</code>
                <span className="text-muted-foreground text-xs">{d}</span>
              </li>
            ))}
          </ul>
        </Card>
      </main>
    </div>
  );
}
