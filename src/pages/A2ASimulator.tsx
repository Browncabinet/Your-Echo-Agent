import { useState } from "react";
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

export default function A2ASimulator() {
  const [running, setRunning] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [chartHtml, setChartHtml] = useState<string>("");

  async function runSimulation() {
    setRunning(true);
    setResults([]);
    setChartHtml("");
    const out: Result[] = [];

    for (const agent of MOCK_AGENTS) {
      const t0 = performance.now();
      try {
        const r1 = await fetch(`${PROJECT_URL}/functions/v1/echo-pipeline?dry=1`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: agent.text }),
        });
        const j1 = await r1.json();
        const t1 = performance.now();

        const rows = [
          { metric: "chars", value: j1.char_count || 0 },
          { metric: "tokens", value: j1.token_estimate || 0 },
          { metric: "keywords", value: (j1.keywords || []).length },
        ];
        const r2 = await fetch(`${PROJECT_URL}/functions/v1/charts-render?dry=1`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ rows }),
        });
        const j2 = await r2.json();
        const t2 = performance.now();

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
        out.push({
          agent: agent.name, pipeline_ms: 0, chart_ms: 0, total_ms: 0,
          summary: "", rows: 0, ok: false, error: e instanceof Error ? e.message : String(e),
        });
        setResults([...out]);
      }
    }
    setRunning(false);
  }

  const avg = results.length ? Math.round(results.reduce((s, r) => s + r.total_ms, 0) / results.length) : 0;
  const okCount = results.filter((r) => r.ok).length;

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-5xl mx-auto space-y-6">
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
            <div dangerouslySetInnerHTML={{ __html: chartHtml }} />
          </Card>
        )}
      </div>
    </div>
  );
}
