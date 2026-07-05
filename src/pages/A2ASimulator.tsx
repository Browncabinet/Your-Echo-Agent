import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const PROJECT_URL = import.meta.env.VITE_SUPABASE_URL;

const MOCK_AGENTS = [
  { name: "SalesLog Bot", text: "Q3 revenue hit $1.2M, up 18% MoM. Top product: Pro plan at 412 sales. Churn down to 2.1%. Two enterprise deals closed worth $85k ARR." },
  { name: "Finance Updater", text: "Operating expenses $340k this month. Runway 14 months. AR aging: 60+ days at $22k. Burn rate steady at $95k." },
  { name: "SEO Tracker", text: "Organic traffic 48,200 sessions (+12%). Top keyword: 'ai outreach' rank 4. Backlinks 1,240. CTR 3.8% in SERP." },
  { name: "Support Triage", text: "382 tickets resolved, median TTR 2.4h. Top issue: SMTP config 18%. CSAT 4.6/5. Escalations down 30%." },
  { name: "Inventory Pinger", text: "SKU A-114 low: 12 units. Restock ETA 5 days. Top mover: B-220 sold 340 units. Dead stock $4.1k value." },
  { name: "Ad Spend Auditor", text: "Google Ads $12k spend, ROAS 3.4x. Meta $8k spend, ROAS 2.1x. CPL down to $24. Best campaign: retargeting at 5.2x." },
  { name: "Lead Scorer", text: "1,840 new leads. 220 MQL, 64 SQL. Top source: organic 38%. Avg score 72/100. 14 hot leads flagged for sales." },
  { name: "Churn Detector", text: "9 at-risk accounts. Combined ARR $42k. Top signal: login frequency drop. Recommended action: success call within 48h." },
  { name: "Email Deliverability", text: "Open rate 41%, click rate 6.2%. Bounce 1.8%. Spam complaints 0.04%. Domain reputation: excellent." },
  { name: "Competitor Watcher", text: "Competitor X launched new pricing tier $49. Y raised $20M Series A. Z removed free plan. 3 new entrants in SMB segment." },
];

type Result = {
  agent: string;
  pipeline_ms: number;
  chart_ms: number;
  total_ms: number;
  summary: string;
  rows: number;
  ok: boolean;
  error?: string;
};

type LogLine = { ts: string; tone: "in" | "out" | "ok" | "err" | "info"; msg: string };

function bytes(s: string) { return new Blob([s]).size; }
function pad(n: number, w = 2) { return String(n).padStart(w, "0"); }
function ts() {
  const d = new Date();
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}.${pad(d.getMilliseconds(), 3)}`;
}

export default function A2ASimulator() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [log, setLog] = useState<LogLine[]>([]);
  const [chartHtml, setChartHtml] = useState<string>("");
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  function push(tone: LogLine["tone"], msg: string) {
    setLog((prev) => [...prev, { ts: ts(), tone, msg }]);
  }

  async function runSimulation() {
    setRunning(true);
    setResults([]);
    setLog([]);
    setChartHtml("");
    push("info", `── Network simulation starting · ${MOCK_AGENTS.length} agents · dry-run mode ──`);

    const out: Result[] = [];

    for (let i = 0; i < MOCK_AGENTS.length; i++) {
      const agent = MOCK_AGENTS[i];
      const tag = `agent#${pad(i + 1)} ${agent.name}`;
      const t0 = performance.now();
      try {
        const body1 = JSON.stringify({ text: agent.text });
        push("in", `${tag} → echo-pipeline      payload=${bytes(body1)}B`);
        const r1 = await fetch(`${PROJECT_URL}/functions/v1/echo-pipeline?dry=1`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: body1,
        });
        const txt1 = await r1.text();
        const j1 = JSON.parse(txt1);
        const t1 = performance.now();
        push(r1.ok ? "ok" : "err",
          `${tag} ← ${r1.status} ${r1.ok ? "ok" : "fail"}   ${Math.round(t1 - t0)}ms   out=${bytes(txt1)}B   kw=${(j1.keywords || []).length}`);

        const body2 = JSON.stringify({
          rows: [
            { metric: "chars", value: j1.char_count || 0 },
            { metric: "tokens", value: j1.token_estimate || 0 },
            { metric: "keywords", value: (j1.keywords || []).length },
          ],
        });
        push("in", `${tag} → charts-render      payload=${bytes(body2)}B`);
        const r2 = await fetch(`${PROJECT_URL}/functions/v1/charts-render?dry=1`, {
          method: "POST", headers: { "Content-Type": "application/json" }, body: body2,
        });
        const txt2 = await r2.text();
        const j2 = JSON.parse(txt2);
        const t2 = performance.now();
        push(r2.ok ? "ok" : "err",
          `${tag} ← ${r2.status} ${r2.ok ? "ok" : "fail"}   ${Math.round(t2 - t1)}ms   out=${bytes(txt2)}B   rows=${j2.rows_count || 0}`);

        out.push({
          agent: agent.name,
          pipeline_ms: Math.round(t1 - t0),
          chart_ms: Math.round(t2 - t1),
          total_ms: Math.round(t2 - t0),
          summary: (j1.summary || "").slice(0, 120),
          rows: j2.rows_count || 0,
          ok: r1.ok && r2.ok,
        });
        setResults([...out]);
        if (!chartHtml && j2.html) setChartHtml(j2.html);
      } catch (e) {
        const err = e instanceof Error ? e.message : String(e);
        push("err", `${tag} ✗ ${err}`);
        out.push({ agent: agent.name, pipeline_ms: 0, chart_ms: 0, total_ms: 0, summary: "", rows: 0, ok: false, error: err });
        setResults([...out]);
      }
    }

    const okN = out.filter((r) => r.ok).length;
    const avg = out.length ? Math.round(out.reduce((s, r) => s + r.total_ms, 0) / out.length) : 0;
    push("info", `── Done · ${okN}/${out.length} ok · avg ${avg}ms ──`);
    setRunning(false);
  }

  const avg = results.length ? Math.round(results.reduce((s, r) => s + r.total_ms, 0) / results.length) : 0;
  const okCount = results.filter((r) => r.ok).length;

  const toneClass = (t: LogLine["tone"]) =>
    t === "in" ? "text-sky-300"
    : t === "ok" ? "text-emerald-300"
    : t === "err" ? "text-rose-300"
    : t === "info" ? "text-amber-300"
    : "text-zinc-300";

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">A2A Network Simulator</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Hidden dev tool. Fires 10 mock discovery agents through <code>/echo-pipeline</code> → <code>/charts-render</code> in dry-run mode (no auth, no AI cost, no billing).
          </p>
        </div>

        <Card className="p-4 flex items-center gap-4">
          <Button onClick={runSimulation} disabled={running}>
            {running ? "Running…" : "Run Network Simulation"}
          </Button>
          {results.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {okCount}/{results.length} ok · avg total {avg}ms
            </div>
          )}
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="px-3 py-2 bg-zinc-900 text-zinc-400 text-xs font-mono border-b border-zinc-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="ml-2">a2a-simulator — live log</span>
          </div>
          <div
            ref={logRef}
            className="bg-zinc-950 text-zinc-200 font-mono text-xs leading-relaxed p-3 h-80 overflow-auto"
          >
            {log.length === 0 ? (
              <div className="text-zinc-600">Waiting for run…</div>
            ) : (
              log.map((l, i) => (
                <div key={i} className={toneClass(l.tone)}>
                  <span className="text-zinc-500">[{l.ts}]</span> {l.msg}
                </div>
              ))
            )}
          </div>
        </Card>

        {results.length > 0 && (
          <Card className="p-4 overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b">
                  <th className="py-2">Agent</th>
                  <th className="py-2">Pipeline</th>
                  <th className="py-2">Chart</th>
                  <th className="py-2">Total</th>
                  <th className="py-2">Summary</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2 font-medium">{r.agent}</td>
                    <td className="py-2">{r.pipeline_ms}ms</td>
                    <td className="py-2">{r.chart_ms}ms</td>
                    <td className="py-2">{r.total_ms}ms</td>
                    <td className="py-2 text-muted-foreground truncate max-w-md">
                      {r.ok ? r.summary : <span className="text-destructive">{r.error || "failed"}</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}

        {chartHtml && (
          <Card className="p-4">
            <h2 className="text-sm font-semibold mb-2">Sample rendered chart (from agent #1)</h2>
            {/* Sandboxed iframe: raw HTML from charts-render is untrusted, so we isolate it. */}
            <iframe
              title="Sample rendered chart"
              sandbox=""
              srcDoc={chartHtml}
              className="w-full h-96 border-0"
            />
          </Card>
        )}
      </div>
    </div>
  );
}
