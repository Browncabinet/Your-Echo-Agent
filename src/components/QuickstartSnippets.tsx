import { useState } from "react";
import { motion } from "framer-motion";
import { Copy, Check, Terminal, Code2, FileCode, Network, Workflow } from "lucide-react";
import { toast as sonner } from "sonner";

type TabKey = "curl" | "ts" | "py" | "mcp" | "langchain";

const TABS: { key: TabKey; label: string; icon: typeof Terminal }[] = [
  { key: "curl", label: "curl", icon: Terminal },
  { key: "ts", label: "TypeScript", icon: Code2 },
  { key: "py", label: "Python", icon: FileCode },
  { key: "mcp", label: "MCP client", icon: Network },
  { key: "langchain", label: "LangChain", icon: Workflow },
];

const SNIPPETS: Record<TabKey, string> = {
  curl: `curl -X POST https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-agent-hire \\
  -H "Authorization: Bearer eak_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "agent_id": "saas-prospector",
    "campaign": {
      "goal": "Book demos with Series A SaaS CTOs",
      "niche": "B2B SaaS",
      "volume": 100,
      "website_url": "https://yourcompany.com"
    },
    "sender_identity": { "name": "Alex", "email": "alex@yourcompany.com" },
    "spending_cap_cents": 2500
  }'`,
  ts: `const res = await fetch(
  "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-agent-hire",
  {
    method: "POST",
    headers: {
      Authorization: \`Bearer \${process.env.ECHO_API_KEY}\`,
      "Content-Type": "application/json",
      "Idempotency-Key": crypto.randomUUID(),
    },
    body: JSON.stringify({
      agent_id: "saas-prospector",
      campaign: { goal, niche, volume: 100, website_url },
      sender_identity: { name, email },
      spending_cap_cents: 2500,
    }),
  }
);
const job = await res.json();`,
  py: `import os, uuid, requests

job = requests.post(
    "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-agent-hire",
    headers={
        "Authorization": f"Bearer {os.environ['ECHO_API_KEY']}",
        "Idempotency-Key": str(uuid.uuid4()),
    },
    json={
        "agent_id": "saas-prospector",
        "campaign": {"goal": goal, "niche": niche, "volume": 100, "website_url": url},
        "sender_identity": {"name": name, "email": email},
        "spending_cap_cents": 2500,
    },
).json()`,
  mcp: `// Any MCP client can import Echo's OpenAPI as a tool catalog
import { Client } from "@modelcontextprotocol/sdk/client";

const client = new Client({ name: "my-agent" });
await client.loadOpenAPI(
  "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-openapi",
  { auth: { type: "bearer", token: process.env.ECHO_API_KEY } }
);

// Echo's hire/list/get-job tools are now callable
const job = await client.callTool("hireAgent", {
  agent_id: "saas-prospector",
  campaign: { goal, niche, volume: 100 },
});`,
  langchain: `from langchain.tools import Tool
import requests, os

def hire_echo_agent(payload: dict) -> dict:
    return requests.post(
        "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-agent-hire",
        headers={"Authorization": f"Bearer {os.environ['ECHO_API_KEY']}"},
        json=payload,
    ).json()

echo_tool = Tool(
    name="hire_echo_outreach_agent",
    description="Hire an autonomous Echo Agent to run a cold-outreach campaign. "
                "Returns job_id, leads_total, spend_cents.",
    func=hire_echo_agent,
)
# add echo_tool to your agent's tool list`,
};

export function QuickstartSnippets() {
  const [tab, setTab] = useState<TabKey>("curl");
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
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[11px] font-mono uppercase tracking-wider text-emerald-300 mb-3">
          Hire Echo in 30 seconds
        </div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-100">Drop-in snippets</h2>
        <p className="text-sm text-zinc-500 mt-1">Copy, paste your API key, ship.</p>
      </div>

      <div className="rounded-xl border border-white/[0.08] bg-[#0a0a12] overflow-hidden">
        {/* Tabs */}
        <div className="flex items-center gap-1 p-1.5 border-b border-white/[0.06] bg-white/[0.02] overflow-x-auto">
          {TABS.map(({ key, label, icon: Icon }) => (
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
        <pre className="text-[12px] leading-relaxed p-5 overflow-x-auto text-zinc-300 font-mono bg-black/30">
          {SNIPPETS[tab]}
        </pre>
      </div>

      {/* Badges */}
      <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
        {[
          { label: "agent-card.json", href: "https://yourechoagent.com/.well-known/agent-card.json" },
          { label: "agent.json", href: "https://yourechoagent.com/.well-known/agent.json" },
          { label: "OpenAPI 3.1", href: "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/a2a-openapi" },
          { label: "llms-full.txt", href: "https://yourechoagent.com/llms-full.txt" },
        ].map(({ label, href }) => (
          <a
            key={label}
            href={href}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/[0.08] bg-white/[0.03] text-[11px] font-mono text-zinc-400 hover:text-zinc-100 hover:border-indigo-500/30 transition"
          >
            {label}
          </a>
        ))}
      </div>
    </motion.section>
  );
}
