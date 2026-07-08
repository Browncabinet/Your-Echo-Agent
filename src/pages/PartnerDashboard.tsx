import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { PartnerShell } from "@/components/PartnerShell";
import { Key, Copy, RefreshCw, Loader2, CheckCircle2, XCircle, ShieldCheck, AlertTriangle, Zap, Terminal, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type Partner = { id: string; balance_cents: number; total_spent_cents: number; billing_email: string; api_key_id: string };
type ApiKey = { id: string; key_prefix: string; status: string; rate_limit_per_min: number; last_used_at: string | null };
type Job = { id: string; agent_id: string; status: string; spend_cents: number; leads_sent: number; created_at: string };
type Callback = { id: string; event_type: string; response_status: number | null; delivered: boolean; created_at: string; callback_url: string };
type RetryRow = { id: string; event_type: string; callback_url: string; attempt: number; max_attempts: number; status: string; next_attempt_at: string; last_error: string | null };

const FUNCTIONS_BASE = "https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1";

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-white/[0.08] bg-[#0d0d14] ${className}`}>
      {children}
    </div>
  );
}

function PanelHeader({ icon: Icon, title, action }: { icon?: typeof Key; title: string; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/[0.06]">
      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
        {Icon && <Icon className="w-3.5 h-3.5 text-indigo-300" />}
        {title}
      </div>
      {action}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    active: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    revoked: "bg-zinc-500/10 text-zinc-400 border-zinc-500/20",
    delivered: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    pending: "bg-amber-500/10 text-amber-300 border-amber-500/20",
    failed_permanent: "bg-red-500/10 text-red-300 border-red-500/20",
    completed: "bg-emerald-500/10 text-emerald-300 border-emerald-500/20",
    running: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  };
  const cls = map[status] || "bg-white/[0.05] text-zinc-300 border-white/10";
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] font-mono uppercase tracking-wider ${cls}`}>
      {status}
    </span>
  );
}

export default function PartnerDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [partner, setPartner] = useState<Partner | null>(null);
  const [keys, setKeys] = useState<ApiKey[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [callbacks, setCallbacks] = useState<Callback[]>([]);
  const [retries, setRetries] = useState<RetryRow[]>([]);
  const [revealedKey, setRevealedKey] = useState<string | null>(null);
  const [revealedSecret, setRevealedSecret] = useState<string | null>(null);
  const [rotating, setRotating] = useState(false);
  const [rotatingSecret, setRotatingSecret] = useState(false);
  const [testHiring, setTestHiring] = useState(false);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    const [{ data: p }, { data: ks }, { data: js }] = await Promise.all([
      supabase.from("a2a_partners").select("id, balance_cents, total_spent_cents, billing_email, api_key_id").eq("owner_user_id", user.id).maybeSingle(),
      supabase.from("a2a_api_keys").select("id, key_prefix, status, rate_limit_per_min, last_used_at").eq("owner_user_id", user.id).order("created_at", { ascending: false }),
      supabase.from("a2a_jobs").select("id, agent_id, status, spend_cents, leads_sent, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(15),
    ]);
    setPartner(p as Partner | null);
    setKeys((ks || []) as ApiKey[]);
    setJobs((js || []) as Job[]);

    if (p?.id) {
      const [{ data: cbs }, { data: rq }] = await Promise.all([
        supabase
          .from("a2a_callbacks_log")
          .select("id, event_type, response_status, delivered, created_at, callback_url")
          .eq("partner_id", p.id)
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("a2a_callback_queue")
          .select("id, event_type, callback_url, attempt, max_attempts, status, next_attempt_at, last_error")
          .eq("partner_id", p.id)
          .order("updated_at", { ascending: false })
          .limit(15),
      ]);
      setCallbacks((cbs || []) as Callback[]);
      setRetries((rq || []) as RetryRow[]);
    } else {
      setCallbacks([]);
      setRetries([]);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handleRotate = async () => {
    const isFirstKey = keys.length === 0;
    if (!isFirstKey && !confirm("Rotate API key? Your current key will stop working immediately.")) return;
    setRotating(true);
    // First-time: call onboard (creates partner row + mints first key).
    // Otherwise: rotate the existing key.
    const fn = isFirstKey ? "a2a-onboard" : "a2a-rotate-key";
    const body = isFirstKey
      ? { display_name: (user?.user_metadata?.full_name as string) || "My Orchestrator Agent", use_case: "agent" }
      : {};
    const { data, error } = await supabase.functions.invoke(fn, { body });
    setRotating(false);
    if (error || !data?.key) { toast.error(error?.message || "Failed to generate key"); return; }
    setRevealedKey(data.key);
    toast.success(isFirstKey ? "Agent key generated — copy it now" : "New key generated — copy it now");
    load();
  };


  const handleRotateSecret = async () => {
    if (!confirm("Rotate webhook secret? Update your verifier before proceeding.")) return;
    setRotatingSecret(true);
    const { data, error } = await supabase.functions.invoke("a2a-rotate-webhook-secret", { body: {} });
    setRotatingSecret(false);
    if (error || !data?.webhook_secret) { toast.error(error?.message || "Failed to rotate"); return; }
    setRevealedSecret(data.webhook_secret);
    toast.success("New webhook secret generated");
  };

  const handleTestHire = async () => {
    setTestHiring(true);
    const { data, error } = await supabase.functions.invoke("a2a-agent-hire", {
      body: {
        agent_id: "saas-prospector",
        campaign: { goal: "Test job from dashboard", volume: 1 },
        spending_cap_cents: 50,
      },
    });
    setTestHiring(false);
    if (error || !data?.job_id) { toast.error(error?.message || "Test hire failed — make sure you have balance"); return; }
    toast.success(`Test job created: ${data.job_id.slice(0, 8)}…`);
    load();
  };

  const fmt = (c: number) => `$${(c / 100).toFixed(2)}`;
  const copy = (s: string, label = "Copied") => { navigator.clipboard.writeText(s); toast.success(label); };

  if (loading) {
    return (
      <PartnerShell>
        <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-zinc-500" /></div>
      </PartnerShell>
    );
  }

  return (
    <PartnerShell>
      <div className="mb-8">
        <div className="flex items-baseline justify-between mb-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <span className="text-xs text-zinc-500 font-mono">{partner?.billing_email}</span>
        </div>
        <p className="text-sm text-zinc-500">Manage keys, monitor jobs, control spend.</p>
      </div>

      {/* Stats */}
      <div className="grid sm:grid-cols-3 gap-4 mb-6">
        {[
          { label: "Balance", value: fmt(partner?.balance_cents || 0), hint: "Available to spend" },
          { label: "Total spent", value: fmt(partner?.total_spent_cents || 0), hint: "All time" },
          { label: "Active keys", value: String(keys.filter(k => k.status === "active").length), hint: `${keys.length} total` },
        ].map((s) => (
          <Panel key={s.label} className="p-5">
            <div className="text-[11px] font-mono uppercase tracking-widest text-zinc-500 mb-1">{s.label}</div>
            <div className="text-3xl font-semibold text-white tabular-nums">{s.value}</div>
            <div className="text-[11px] text-zinc-600 mt-1">{s.hint}</div>
          </Panel>
        ))}
      </div>

      {/* Prominent Generate Agent Key CTA (first-time users) */}
      {keys.length === 0 && (
        <div className="mb-6 rounded-xl border-2 border-indigo-500/40 bg-gradient-to-br from-indigo-500/[0.08] via-transparent to-emerald-500/[0.06] p-6 sm:p-7">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Key className="w-4 h-4 text-indigo-300" />
                <p className="text-[11px] font-mono uppercase tracking-widest text-indigo-300">Step 1 · Get your key</p>
              </div>
              <h2 className="text-xl sm:text-2xl font-semibold text-zinc-100 mb-1.5">Generate your Agent API Key</h2>
              <p className="text-sm text-zinc-400">
                One click. Auto-named <span className="text-zinc-200 font-mono">"My Orchestrator Agent"</span>. Use it from Claude, Cursor, LangGraph, CrewAI, or any A2A/MCP client.
              </p>
            </div>
            <Button
              size="lg"
              onClick={handleRotate}
              disabled={rotating}
              className="shrink-0 h-12 px-6 bg-indigo-500 hover:bg-indigo-400 text-white font-medium gap-2"
            >
              {rotating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              Generate Agent Key
            </Button>
          </div>
        </div>
      )}

      {/* Quick actions */}
      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        <Link to="/for-agents" className="rounded-xl border border-white/[0.08] bg-[#0d0d14] p-4 hover:border-indigo-500/30 hover:bg-[#11111c] transition">
          <Terminal className="w-4 h-4 text-indigo-300 mb-2" />
          <p className="font-medium text-sm text-zinc-100">Browse Agents</p>
          <p className="text-[11px] text-zinc-500 mt-1">6 agents live · per-result pricing</p>
        </Link>
        <Link to="/for-agents/billing" className="rounded-xl border border-white/[0.08] bg-[#0d0d14] p-4 hover:border-indigo-500/30 hover:bg-[#11111c] transition">
          <Zap className="w-4 h-4 text-indigo-300 mb-2" />
          <p className="font-medium text-sm text-zinc-100">Top up balance</p>
          <p className="text-[11px] text-zinc-500 mt-1">Stripe · no subscription · pay-per-result</p>
        </Link>
        <Link to="/for-agents/docs" className="rounded-xl border border-white/[0.08] bg-[#0d0d14] p-4 hover:border-indigo-500/30 hover:bg-[#11111c] transition">
          <ExternalLink className="w-4 h-4 text-indigo-300 mb-2" />
          <p className="font-medium text-sm text-zinc-100">API Docs</p>
          <p className="text-[11px] text-zinc-500 mt-1">Endpoints, webhooks, errors</p>
        </Link>
      </div>

      {/* Quick start (only if no jobs) */}
      {jobs.length === 0 && (
        <Panel className="mb-6">
          <PanelHeader
            icon={Zap}
            title="Quick start"
            action={
              <Button size="sm" onClick={handleTestHire} disabled={testHiring} className="h-7 px-3 bg-indigo-500 hover:bg-indigo-400 text-white text-xs gap-1.5">
                {testHiring ? <Loader2 className="w-3 h-3 animate-spin" /> : <Zap className="w-3 h-3" />}
                Hire test job ($0.50 cap)
              </Button>
            }
          />
          <div className="p-5 space-y-4">
            {[
              { n: 1, title: "List available agents", cmd: `curl ${FUNCTIONS_BASE}/a2a-agents-list` },
              { n: 2, title: "Get an Agent Card", cmd: `curl ${FUNCTIONS_BASE}/a2a-agent-get/saas-prospector` },
              { n: 3, title: "Hire (use your eak_ key)", cmd: `curl -X POST ${FUNCTIONS_BASE}/a2a-agent-hire \\
  -H "Authorization: Bearer eak_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"agent_id":"saas-prospector","campaign":{"goal":"Book demos","volume":5},"spending_cap_cents":200}'` },
              { n: 4, title: "Poll job status", cmd: `curl ${FUNCTIONS_BASE}/a2a-job-get/JOB_ID -H "Authorization: Bearer eak_YOUR_KEY"` },
            ].map((step) => (
              <div key={step.n}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="w-5 h-5 rounded-full bg-white/[0.06] border border-white/[0.08] text-[10px] font-mono text-zinc-400 flex items-center justify-center">{step.n}</span>
                  <span className="text-sm font-medium text-zinc-200">{step.title}</span>
                  <button onClick={() => copy(step.cmd)} className="ml-auto text-[10px] text-zinc-500 hover:text-zinc-200 font-mono flex items-center gap-1">
                    <Copy className="w-2.5 h-2.5" /> copy
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-zinc-400 bg-black/40 border border-white/[0.06] rounded-md p-3 overflow-x-auto">{step.cmd}</pre>
              </div>
            ))}
          </div>
        </Panel>
      )}

      {/* API keys */}
      <Panel className="mb-6">
        <PanelHeader
          icon={Key}
          title="API keys"
          action={
            <Button size="sm" onClick={handleRotate} disabled={rotating} className="h-7 px-3 bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.08] text-xs gap-1.5">
              {rotating ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
              {keys.length === 0 ? "Generate Agent Key" : "Rotate key"}
            </Button>

          }
        />
        <div className="p-5">
          {revealedKey && (
            <div className="mb-4 rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] p-3">
              <p className="text-[11px] font-mono text-emerald-300 uppercase tracking-wider mb-2">⚠ Copy this key — it won't be shown again</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-xs bg-black/50 border border-white/[0.06] p-2 rounded font-mono break-all text-emerald-200">{revealedKey}</code>
                <Button size="sm" variant="outline" onClick={() => copy(revealedKey)} className="h-8 px-2.5 border-white/[0.1] bg-white/[0.04] text-zinc-100 hover:bg-white/[0.08]"><Copy className="w-3 h-3" /></Button>
              </div>
            </div>
          )}
          {keys.length === 0 ? (
            <p className="text-sm text-zinc-500">No keys yet. Click "Generate key" above to create one.</p>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {keys.map(k => (
                <div key={k.id} className="py-3 flex items-center justify-between text-sm first:pt-0 last:pb-0">
                  <div>
                    <code className="font-mono text-xs text-zinc-200">{k.key_prefix}…</code>
                    <div className="text-[11px] text-zinc-500 mt-0.5">{k.rate_limit_per_min}/min · {k.last_used_at ? `last used ${new Date(k.last_used_at).toLocaleDateString()}` : "never used"}</div>
                  </div>
                  <StatusBadge status={k.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>

      {/* Shareable Integration Link — embed / share Echo in one line */}
      <Panel className="mb-6">
        <PanelHeader icon={ExternalLink} title="Shareable integration link" />
        <div className="p-5 space-y-4">
          <p className="text-sm text-zinc-500">
            Send these to any developer, orchestrator, or teammate. They install Echo in one click — no coding required.
          </p>

          {[
            {
              label: "MCP endpoint (Claude / Cursor / Windsurf / ChatGPT)",
              value: `${FUNCTIONS_BASE}/mcp-http`,
              hint: "Paste into any MCP client config as transport: streamable-http.",
            },
            {
              label: "Agent discovery URL (.well-known)",
              value: "https://yourechoagent.com/.well-known/agent-card.json",
              hint: "A2A 0.3.0 agent card. Registries and orchestrators auto-discover from here.",
            },
            {
              label: "Quickstart share link",
              value: "https://yourechoagent.com/for-agents/quickstart",
              hint: "Copy-paste guides for LangGraph, CrewAI, Claude Desktop, and more.",
            },
          ].map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">{item.label}</span>
                <button onClick={() => copy(item.value)} className="text-[10px] text-zinc-500 hover:text-zinc-200 font-mono flex items-center gap-1">
                  <Copy className="w-2.5 h-2.5" /> copy
                </button>
              </div>
              <code className="block text-xs bg-black/40 border border-white/[0.06] p-2.5 rounded font-mono break-all text-emerald-300">{item.value}</code>
              <p className="text-[11px] text-zinc-600 mt-1">{item.hint}</p>
            </div>
          ))}

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500">Embed snippet (drop-in MCP config)</span>
              <button
                onClick={() => copy(`{
  "mcpServers": {
    "echo": {
      "transport": "streamable-http",
      "url": "${FUNCTIONS_BASE}/mcp-http",
      "headers": { "Authorization": "Bearer eak_YOUR_KEY" }
    }
  }
}`)}
                className="text-[10px] text-zinc-500 hover:text-zinc-200 font-mono flex items-center gap-1"
              >
                <Copy className="w-2.5 h-2.5" /> copy
              </button>
            </div>
            <pre className="text-[11px] font-mono text-zinc-300 bg-black/40 border border-white/[0.06] rounded-md p-3 overflow-x-auto">{`{
  "mcpServers": {
    "echo": {
      "transport": "streamable-http",
      "url": "${FUNCTIONS_BASE}/mcp-http",
      "headers": { "Authorization": "Bearer eak_YOUR_KEY" }
    }
  }
}`}</pre>
          </div>
        </div>
      </Panel>



      {/* Webhook secret */}
      {partner && (
        <Panel className="mb-6">
          <PanelHeader
            icon={ShieldCheck}
            title="Webhook signing secret"
            action={
              <Button size="sm" onClick={handleRotateSecret} disabled={rotatingSecret} className="h-7 px-3 bg-white/[0.06] hover:bg-white/[0.1] text-zinc-200 border border-white/[0.08] text-xs gap-1.5">
                {rotatingSecret ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                Rotate
              </Button>
            }
          />
          <div className="p-5">
            <p className="text-sm text-zinc-500 mb-3">
              Callbacks are signed with HMAC-SHA256 in <code className="bg-white/[0.05] text-zinc-200 px-1.5 rounded font-mono text-xs">X-Echo-Signature</code>.
            </p>
            {revealedSecret ? (
              <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/[0.06] p-3">
                <p className="text-[11px] font-mono text-emerald-300 uppercase tracking-wider mb-2">⚠ Copy now — won't be shown again</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-black/50 border border-white/[0.06] p-2 rounded font-mono break-all text-emerald-200">{revealedSecret}</code>
                  <Button size="sm" variant="outline" onClick={() => copy(revealedSecret)} className="h-8 px-2.5 border-white/[0.1] bg-white/[0.04] text-zinc-100 hover:bg-white/[0.08]"><Copy className="w-3 h-3" /></Button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-zinc-600 font-mono">Hidden — rotate to reveal a new value.</p>
            )}
          </div>
        </Panel>
      )}

      {/* Jobs */}
      <Panel className="mb-6">
        <PanelHeader icon={Terminal} title="Recent jobs" action={
          <Link to="/for-agents" className="text-[11px] text-zinc-500 hover:text-zinc-200 font-mono flex items-center gap-1">
            Browse agents <ExternalLink className="w-2.5 h-2.5" />
          </Link>
        } />
        <div className="p-5">
          {jobs.length === 0 ? (
            <p className="text-sm text-zinc-500">No jobs yet — run a test hire above to see it appear here.</p>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {jobs.map(j => (
                <div key={j.id} className="py-3 flex items-center justify-between text-sm first:pt-0 last:pb-0">
                  <div>
                    <div className="font-medium text-zinc-100">{j.agent_id}</div>
                    <div className="text-[11px] text-zinc-500 font-mono">{new Date(j.created_at).toLocaleString()}</div>
                  </div>
                  <div className="flex items-center gap-4">
                    <StatusBadge status={j.status} />
                    <div className="text-right">
                      <div className="text-zinc-100 tabular-nums">{fmt(j.spend_cents)}</div>
                      <div className="text-[11px] text-zinc-500">{j.leads_sent} sent</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>

      {/* Callbacks */}
      <Panel className="mb-6">
        <PanelHeader title="Callback log" />
        <div className="p-5">
          {callbacks.length === 0 ? (
            <p className="text-sm text-zinc-500">No callbacks yet.</p>
          ) : (
            <div className="divide-y divide-white/[0.05]">
              {callbacks.map(c => (
                <div key={c.id} className="py-2 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {c.delivered ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> : <XCircle className="w-3.5 h-3.5 text-red-400 shrink-0" />}
                    <code className="font-mono text-zinc-200">{c.event_type}</code>
                    <span className="text-zinc-500 truncate">{c.callback_url || "(no url)"}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 font-mono text-zinc-500">
                    <span>{c.response_status ?? "—"}</span>
                    <span>{new Date(c.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </Panel>

      {/* Retry queue */}
      {retries.length > 0 && (
        <Panel className="mb-6">
          <PanelHeader icon={AlertTriangle} title="Webhook retry queue" />
          <div className="p-5">
            <p className="text-[11px] text-zinc-500 font-mono mb-3">Failed deliveries retry with exponential backoff. After 5 attempts → failed_permanent.</p>
            <div className="divide-y divide-white/[0.05]">
              {retries.map(r => (
                <div key={r.id} className="py-2 flex items-center justify-between text-xs gap-3 first:pt-0 last:pb-0">
                  <div className="flex items-center gap-2 min-w-0">
                    <StatusBadge status={r.status} />
                    <code className="font-mono text-zinc-200">{r.event_type}</code>
                    <span className="text-zinc-500 truncate">{r.callback_url}</span>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 text-zinc-500 font-mono">
                    <span>{r.attempt}/{r.max_attempts}</span>
                    {r.status === "pending" && <span>next {new Date(r.next_attempt_at).toLocaleTimeString()}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Panel>
      )}
    </PartnerShell>
  );
}
