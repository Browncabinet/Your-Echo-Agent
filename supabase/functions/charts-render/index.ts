// POST /functions/v1/charts-render
// Accepts structured JSON -> returns interactive HTML table + inline SVG bar chart.
// Zero AI cost. Pure deterministic rendering.
import { authenticateApiKey, checkRateLimit, corsHeaders, errorJson, json } from "../_shared/a2a.ts";

const MAX_ROWS = 500;

function esc(s: unknown): string {
  return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

function renderTable(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "<p>No data</p>";
  const cols = Array.from(new Set(rows.flatMap((r) => Object.keys(r))));
  const head = cols.map((c) => `<th style="text-align:left;padding:6px 10px;border-bottom:1px solid #ddd">${esc(c)}</th>`).join("");
  const body = rows.map((r) =>
    `<tr>${cols.map((c) => `<td style="padding:6px 10px;border-bottom:1px solid #f0f0f0">${esc(r[c])}</td>`).join("")}</tr>`
  ).join("");
  return `<table style="border-collapse:collapse;font:13px system-ui;width:100%"><thead><tr>${head}</tr></thead><tbody>${body}</tbody></table>`;
}

function renderBarChart(labels: string[], values: number[]): string {
  if (!values.length) return "";
  const max = Math.max(...values, 1);
  const W = 600, H = 240, P = 30;
  const bw = (W - P * 2) / values.length;
  const bars = values.map((v, i) => {
    const h = ((H - P * 2) * v) / max;
    const x = P + i * bw + 4;
    const y = H - P - h;
    return `<rect x="${x}" y="${y}" width="${bw - 8}" height="${h}" fill="#3B82F6" rx="3"/>
      <text x="${x + (bw - 8) / 2}" y="${H - P + 14}" font-size="10" text-anchor="middle" fill="#555">${esc(labels[i])}</text>
      <text x="${x + (bw - 8) / 2}" y="${y - 4}" font-size="10" text-anchor="middle" fill="#222">${v}</text>`;
  }).join("");
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;max-width:${W}px;font-family:system-ui">${bars}</svg>`;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return errorJson("method_not_allowed", "POST required", 405);

  const url = new URL(req.url);
  const isDry = url.searchParams.get("dry") === "1";
  const format = url.searchParams.get("format") || "json"; // json | html

  if (!isDry) {
    const key = await authenticateApiKey(req);
    if (!key) return errorJson("unauthorized", "Missing or invalid Echo Agent API key", 401);
    const rl = await checkRateLimit(key.id, key.rate_limit_per_min);
    if (!rl.allowed) return errorJson("rate_limited", `Limit ${rl.limit}/min`, 429);
  }

  let body: any;
  try { body = await req.json(); } catch { return errorJson("invalid_body", "Expected JSON", 400); }

  // Accept {rows: [...]}  OR  {labels:[], values:[]}  OR  array of objects
  const rows: Record<string, unknown>[] = Array.isArray(body) ? body : (body?.rows || []);
  if (rows.length > MAX_ROWS) return errorJson("payload_too_large", `Max ${MAX_ROWS} rows`, 413);

  let labels: string[] = body?.labels || [];
  let values: number[] = body?.values || [];
  if ((!labels.length || !values.length) && rows.length) {
    const numKey = Object.keys(rows[0]).find((k) => typeof rows[0][k] === "number");
    const labKey = Object.keys(rows[0]).find((k) => typeof rows[0][k] === "string");
    if (numKey) {
      values = rows.map((r) => Number(r[numKey]) || 0);
      labels = labKey ? rows.map((r) => String(r[labKey])) : rows.map((_, i) => `#${i + 1}`);
    }
  }

  const html = `${renderBarChart(labels, values)}${renderTable(rows)}`;

  if (format === "html") {
    return new Response(html, { headers: { ...corsHeaders, "Content-Type": "text/html; charset=utf-8" } });
  }
  return json({ ok: true, html, rows_count: rows.length, chart: { labels, values } });
});
