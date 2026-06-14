// POST /functions/v1/echo-pipeline
// Compresses raw text -> structured JSON summary.
// Default: deterministic, zero-cost compression. mode=ai -> uses Lovable AI (cheap model).
// Auth: requires Echo Agent bearer key (eak_) OR ?dry=1 for the simulator.
import { authenticateApiKey, checkRateLimit, corsHeaders, errorJson, json } from "../_shared/a2a.ts";

const MAX_INPUT_BYTES = 20_000; // hard cap to protect cost
const STOPWORDS = new Set("the a an and or but if then so of to in on for with at by from as is are was were be been being it this that these those i you we they he she them us our your their".split(" "));

function deterministicSummary(text: string) {
  const clean = text.replace(/\s+/g, " ").trim();
  // sentence split, dedupe, take top 3 by keyword density
  const sentences = clean.split(/(?<=[.!?])\s+/).filter((s) => s.length > 12).slice(0, 100);
  const wordCounts = new Map<string, number>();
  for (const w of clean.toLowerCase().split(/[^a-z0-9]+/)) {
    if (w.length < 4 || STOPWORDS.has(w)) continue;
    wordCounts.set(w, (wordCounts.get(w) || 0) + 1);
  }
  const keywords = [...wordCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([k]) => k);
  const scored = sentences.map((s) => {
    const lw = s.toLowerCase();
    const score = keywords.reduce((acc, k) => acc + (lw.includes(k) ? 1 : 0), 0);
    return { s, score };
  });
  const top = scored.sort((a, b) => b.score - a.score).slice(0, 3).map((x) => x.s);
  // simple numeric extraction
  const numbers = [...clean.matchAll(/(\$?\d[\d,.]*\s?(?:%|k|m|b|usd|eur)?)/gi)].slice(0, 20).map((m) => m[0]);
  return {
    summary: top.join(" "),
    keywords,
    numbers,
    char_count: clean.length,
    token_estimate: Math.ceil(clean.length / 4),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return errorJson("method_not_allowed", "POST required", 405);

  const url = new URL(req.url);
  const isDry = url.searchParams.get("dry") === "1";
  const mode = url.searchParams.get("mode") === "ai" ? "ai" : "fast";

  // Auth (dry mode bypass for simulator)
  let apiKeyId: string | null = null;
  if (!isDry) {
    const key = await authenticateApiKey(req);
    if (!key) return errorJson("unauthorized", "Missing or invalid Echo Agent API key (eak_...)", 401);
    apiKeyId = key.id;
    const rl = await checkRateLimit(key.id, key.rate_limit_per_min);
    if (!rl.allowed) return errorJson("rate_limited", `Limit ${rl.limit}/min`, 429);
  }

  // Parse body — accept raw text OR { text: "..." }
  const contentType = req.headers.get("content-type") || "";
  let text = "";
  try {
    if (contentType.includes("application/json")) {
      const body = await req.json();
      text = typeof body === "string" ? body : (body?.text ?? body?.input ?? "");
    } else {
      text = await req.text();
    }
  } catch {
    return errorJson("invalid_body", "Could not parse request body", 400);
  }
  if (!text || typeof text !== "string") return errorJson("invalid_body", "Provide raw text or { text }", 400);
  if (text.length > MAX_INPUT_BYTES) return errorJson("payload_too_large", `Max ${MAX_INPUT_BYTES} chars`, 413);

  const started = Date.now();
  let result = deterministicSummary(text);

  if (mode === "ai" && !isDry) {
    try {
      const aiKey = Deno.env.get("LOVABLE_API_KEY");
      if (aiKey) {
        const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${aiKey}` },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              { role: "system", content: "Return strict JSON: {summary, keywords[], numbers[], category}. Be terse." },
              { role: "user", content: text.slice(0, MAX_INPUT_BYTES) },
            ],
            response_format: { type: "json_object" },
          }),
          signal: AbortSignal.timeout(20_000),
        });
        if (r.ok) {
          const j = await r.json();
          const parsed = JSON.parse(j.choices?.[0]?.message?.content ?? "{}");
          result = { ...result, ...parsed };
        }
      }
    } catch (e) {
      console.warn("ai mode failed, returning deterministic", e);
    }
  }

  return json({
    ok: true,
    mode: isDry ? "dry" : mode,
    latency_ms: Date.now() - started,
    api_key_id: apiKeyId,
    ...result,
  });
});
