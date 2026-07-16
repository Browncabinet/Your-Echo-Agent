import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Terminal, Search, Send, Clock, Workflow } from "lucide-react";
import { toast as sonner } from "sonner";

type ExampleKey = "discover" | "hire" | "status" | "workflow";

const EXAMPLES: { key: ExampleKey; label: string; icon: typeof Terminal }[] = [
  { key: "discover", label: "Discover events", icon: Search },
  { key: "hire", label: "Hire an agent", icon: Send },
  { key: "status", label: "Check job status", icon: Clock },
  { key: "workflow", label: "Full workflow", icon: Workflow },
];

const SNIPPETS: Record<ExampleKey, string> = {
  discover: `# Discover events and communities (no API key required)
curl -X POST https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http \
  -H "Content-Type: application/json" \
  -H "Accept: application/json" \
  -H "Authorization: Bearer eak_YOUR_KEY" \
  -d '{
    "jsonrpc": "2.0",
    "id": 1,
    "method": "tools/call",
    "params": {
      "name": "discover_events",
      "arguments": {
        "niche": "B2B SaaS founders",
        "event_types": ["conference", "webinar", "podcast"],
        "limit": 10
      }
    }
  }'`,
  hire: `# Hire the SaaS Prospector agent
curl -X POST https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-agent-hire \
  -H "Authorization: Bearer eak_YOUR_KEY" \
  -H "Content-Type: application/json" \
  -H "Idempotency-Key: $(uuidgen)" \
  -d '{
    "agent_id": "saas-prospector",
    "campaign": {
      "goal": "Book demos with Series A SaaS CTOs",
      "niche": "B2B SaaS",
      "volume": 100,
      "website_url": "https://yourcompany.com"
    },
    "sender_identity": {
      "name": "Alex Chen",
      "email": "alex@yourcompany.com",
      "scheduling_link": "https://cal.com/alex"
    },
    "callback_url": "https://your-agent.example.com/a2a/callback",
    "spending_cap_cents": 2500
  }'`,
  status: `# Poll job status and results
curl https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-job-get/<job_id> \
  -H "Authorization: Bearer eak_YOUR_KEY"`,
  workflow: `# Python: discover an event, then hire Your Echo to outreach attendees
import requests, os, uuid

base = "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1"
headers = {"Authorization": f"Bearer {os.environ['ECHO_API_KEY']}"}

# 1. Discover events
events = requests.post(f"{base}/mcp-http", headers=headers, json={
    "jsonrpc": "2.0", "id": 1, "method": "tools/call",
    "params": {"name": "discover_events",
               "arguments": {"niche": "AI agents", "event_types": ["conference"], "limit": 5}}
}).json()

# 2. Hire an agent for the first event
event = events["result"]["events"][0]
job = requests.post(f"{base}/a2a-agent-hire", headers={**headers, "Idempotency-Key": str(uuid.uuid4())}, json={
    "agent_id": "saas-prospector",
    "campaign": {"goal": f\"Pitch attendees of {event['name']}\", "niche": "AI agents", "volume": 50},
    "sender_identity": {"name": "Alex", "email": "alex@yourcompany.com"},
    "spending_cap_cents": 1500
}).json()

print("Job ID:", job["job_id"])`,
};

export function PracticalExamples() {
  const [tab, setTab] = useState<ExampleKey>("discover");
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(SNIPPETS[tab]);
      setCopied(true);
      sonner.success("Copied to clipboard");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      sonner.error("Copy failed");
    }
  };

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mb-12"
    >
      <div className="text-center mb-5">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-mono uppercase tracking-wider text-indigo-300 mb-3">
          Copy, paste, run
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Practical agent examples</h2>
        <p className="text-sm text-zinc-500 mt-1">Real commands you can run right now.</p>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#0a0a12] overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1.5 border-b border-white/[0.06] bg-white/[0.02] overflow-x-auto">
          {EXAMPLES.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                tab === key
                  ? "bg-white/[0.08] text-zinc-100"
                  : "text-zinc-500 hover:text-zinc-200 hover:bg-white/[0.04]"
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              {label}
            </button>
          ))}
          <div className="flex-1" />
          <button
            onClick={copy}
            className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] text-zinc-500 hover:text-zinc-100 hover:bg-white/[0.04] font-mono"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "copied" : "copy"}
          </button>
        </div>

        {/* Code */}
        <pre className="text-[12px] leading-relaxed p-5 overflow-x-auto text-zinc-300 font-mono bg-black/30 min-h-[260px]">
          {SNIPPETS[tab]}
        </pre>
      </div>
    </motion.section>
  );
}
