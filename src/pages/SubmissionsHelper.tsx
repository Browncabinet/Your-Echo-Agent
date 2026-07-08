import { useState } from "react";
import { Copy, Check, ExternalLink, GitPullRequest, FileEdit } from "lucide-react";
import { toast } from "sonner";

type Block = { label: string; value: string; lang?: string };
type Submission = {
  id: string;
  repo: string;
  repoUrl: string;
  type: "PR" | "Discussion Comment";
  file: string;
  section: string;
  branch?: string;
  commit?: string;
  blocks: Block[];
  steps: string[];
};

const ENTRY_MD = `- [Your Echo](https://yourechoagent.com) — A2A + MCP outbound outreach agent other agents hire. Discovers events, webinars, podcasts and communities; finds warm leads; drafts hyper-personalized emails and PR pitches; sends with deliverability safeguards; triages replies. Prepaid, pay-per-delivered-email — no subscription. [Agent Card](https://yourechoagent.com/.well-known/agent-card.json) · [Docs](https://yourechoagent.com/for-agents/docs)`;

const ENTRY_MD_SHORT = `- [Your Echo](https://yourechoagent.com) — A2A + MCP outbound outreach agent other agents hire. Event/webinar/podcast discovery, warm lead generation, hyper-personalized email + PR pitch drafting, deliverability-safe sending, and reply triage. JSON-RPC A2A endpoint, HTTP 402 top-up flow, prepaid pay-per-delivered-email. [Agent Card](https://yourechoagent.com/.well-known/agent-card.json)`;

const PR_DESC = `### Add Your Echo to Awesome-A2A

**Project:** Your Echo — https://yourechoagent.com
**Agent Card:** https://yourechoagent.com/.well-known/agent-card.json
**A2A endpoint (JSON-RPC):** https://yourechoagent.com/a2a
**Docs:** https://yourechoagent.com/for-agents/docs
**Quickstart:** https://yourechoagent.com/for-agents/quickstart

**What it does**
Your Echo is an outbound-outreach agent that other AI agents can hire over A2A or MCP. It discovers relevant events, webinars, podcasts and communities in a niche, finds verified warm leads, drafts hyper-personalized emails and PR pitches, sends with deliverability safeguards, and triages replies.

**Protocols**
- A2A 0.3.0 (JSON-RPC + HTTP+JSON)
- MCP (streamable-http + stdio, npm: \`@browncabinet/yourechoagent-mcp\`)

**Skills**
\`discover_events\`, \`find_warm_leads\`, \`draft_personalized_email\`, \`send_with_safeguards\`, \`triage_replies\`

**Billing**
Prepaid, pay-per-delivered-email. 50 free emails on signup. Packs from $25 to $149 (10k Agency). No subscription, credits never expire. Autonomous callers get HTTP 402 + signed \`top_up_url\` when balance runs low; retry with the same \`Idempotency-Key\` resumes the hire.

**Checklist**
- [x] Agent Card served at \`/.well-known/agent-card.json\`
- [x] Public JSON-RPC endpoint
- [x] MCP server published on npm
- [x] Docs + quickstart live
- [x] Alphabetical placement in section

Happy to adjust wording/placement.`;

const DISCUSSION_COMMENT = `### Your Echo — A2A + MCP outbound outreach agent

**Homepage:** https://yourechoagent.com
**Agent Card:** https://yourechoagent.com/.well-known/agent-card.json
**A2A JSON-RPC:** https://yourechoagent.com/a2a
**Docs:** https://yourechoagent.com/for-agents/docs
**MCP server:** \`npx -y @browncabinet/yourechoagent-mcp\`

**Summary**
Outbound-outreach agent other AI agents hire. Discovers events, webinars, podcasts and communities; finds warm leads; drafts hyper-personalized emails and PR pitches; sends with deliverability safeguards; triages replies.

**Protocol notes**
- A2A 0.3.0 — JSON-RPC preferred, HTTP+JSON also exposed
- \`push_notifications: true\`, \`state_transition_history: true\`
- Auth: bearer API key (\`eak_*\`) or user JWT
- Autonomous-friendly billing: HTTP 402 + signed \`top_up_url\`; resume with \`Idempotency-Key\`

**Skills**
\`discover_events\`, \`find_warm_leads\`, \`draft_personalized_email\`, \`send_with_safeguards\`, \`triage_replies\`

Happy to add usage examples or a hire-flow snippet if useful.`;

const SUBMISSIONS: Submission[] = [
  {
    id: "ai-boost",
    repo: "ai-boost/awesome-a2a",
    repoUrl: "https://github.com/ai-boost/awesome-a2a",
    type: "PR",
    file: "README.md",
    section: "## 🤖 Agents (or nearest Community Agents / Servers section)",
    branch: "add-your-echo",
    commit: "Add Your Echo to agents list",
    blocks: [
      { label: "PR title", value: "Add Your Echo — A2A + MCP outbound outreach agent" },
      { label: "README entry (paste in section, keep alphabetical)", value: ENTRY_MD_SHORT, lang: "markdown" },
      { label: "PR description", value: PR_DESC, lang: "markdown" },
    ],
    steps: [
      "Fork ai-boost/awesome-a2a on GitHub",
      "Create branch: add-your-echo",
      "Open README.md and locate the Agents section",
      "Paste the README entry in alphabetical order",
      "Commit: 'Add Your Echo to agents list'",
      "Open PR with the title and description above",
      "Enable 'Allow edits by maintainers'",
    ],
  },
  {
    id: "pab1it0",
    repo: "pab1it0/awesome-a2a",
    repoUrl: "https://github.com/pab1it0/awesome-a2a",
    type: "PR",
    file: "README.md",
    section: "## Agents (or nearest agents/servers section)",
    branch: "add-your-echo",
    commit: "Add Your Echo to agents list",
    blocks: [
      { label: "PR title", value: "Add Your Echo — outbound outreach A2A agent" },
      { label: "README entry (long-form)", value: ENTRY_MD, lang: "markdown" },
      { label: "PR description", value: PR_DESC, lang: "markdown" },
    ],
    steps: [
      "Fork pab1it0/awesome-a2a on GitHub",
      "Create branch: add-your-echo",
      "Open README.md and locate the Agents section",
      "Paste the entry in alphabetical order",
      "Commit: 'Add Your Echo to agents list'",
      "Open PR with the title and description above",
      "Enable 'Allow edits by maintainers'",
    ],
  },
  {
    id: "a2a-discussion",
    repo: "a2aproject/A2A — Discussion #741",
    repoUrl: "https://github.com/a2aproject/A2A/discussions/741",
    type: "Discussion Comment",
    file: "N/A (post a reply in the thread)",
    section: "Community Agent Showcase discussion",
    blocks: [
      { label: "Discussion comment", value: DISCUSSION_COMMENT, lang: "markdown" },
    ],
    steps: [
      "Open discussion #741 on a2aproject/A2A",
      "Scroll to the reply box at the bottom",
      "Paste the comment above",
      "Post reply",
      "Watch for maintainer feedback and reply with adjustments if requested",
    ],
  },
];

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        toast.success("Copied");
        setTimeout(() => setCopied(false), 1500);
      }}
      className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-mono text-zinc-400 hover:text-zinc-100 border border-white/10 hover:border-indigo-500/40 bg-white/5 transition"
    >
      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {copied ? "copied" : "copy"}
    </button>
  );
}

function BlockView({ block }: { block: Block }) {
  return (
    <div className="rounded-lg border border-white/10 bg-black/30 overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/10 bg-white/[0.02]">
        <span className="text-xs font-medium text-zinc-300">{block.label}</span>
        <CopyButton text={block.value} />
      </div>
      <pre className="text-[12px] leading-relaxed p-4 overflow-x-auto text-zinc-300 font-mono whitespace-pre-wrap break-words">
        {block.value}
      </pre>
    </div>
  );
}

export default function SubmissionsHelper() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-10">
        <header className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[11px] font-mono uppercase tracking-wider text-indigo-300 mb-3">
            Submissions helper
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">Awesome-A2A PR helper</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Copy-ready titles, descriptions, and file-edit instructions for each registry. Open the repo, click copy, paste.
          </p>
        </header>

        <div className="space-y-8">
          {SUBMISSIONS.map((s) => (
            <section key={s.id} className="rounded-xl border border-white/10 bg-white/[0.02] p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                    {s.type === "PR" ? <GitPullRequest className="w-3.5 h-3.5" /> : <FileEdit className="w-3.5 h-3.5" />}
                    {s.type}
                  </div>
                  <h2 className="text-lg font-semibold text-zinc-100">{s.repo}</h2>
                  <div className="text-xs text-zinc-500 mt-1">
                    <span className="text-zinc-400">File:</span> {s.file} &nbsp;·&nbsp;
                    <span className="text-zinc-400">Section:</span> {s.section}
                    {s.branch && (
                      <>
                        {" "}
                        &nbsp;·&nbsp; <span className="text-zinc-400">Branch:</span> {s.branch}
                      </>
                    )}
                  </div>
                </div>
                <a
                  href={s.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-zinc-200 border border-white/10 hover:border-indigo-500/40 bg-white/5 transition"
                >
                  Open <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              <ol className="text-sm text-zinc-400 list-decimal pl-5 space-y-1 mb-5">
                {s.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>

              <div className="space-y-3">
                {s.blocks.map((b, i) => (
                  <BlockView key={i} block={b} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-10 text-xs text-zinc-500 text-center">
          Full pack: <code className="text-zinc-400">docs/phase-3-awesome-a2a-submissions.md</code>
        </footer>
      </div>
    </div>
  );
}
