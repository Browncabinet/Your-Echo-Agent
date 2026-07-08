// Look up work emails for extracted contacts via Hunter.io.
// Charges 1 email-unit per verified match, 1 per guessed, 0 if not found.
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, s = 200) =>
  new Response(JSON.stringify(b), { status: s, headers: { ...corsHeaders, "Content-Type": "application/json" } });

type Contact = {
  name?: string; role?: string; email?: string;
  linkedin?: string; twitter?: string;
  score?: number; verification?: string; enriched_at?: string;
};

function splitName(name: string): { first: string; last: string } | null {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return null;
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function domainFromUrl(u: string | null | undefined): string | null {
  if (!u) return null;
  try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return null; }
}

function pickDomain(opp: Record<string, unknown>): string | null {
  const contacts = (opp.contacts as Contact[] | undefined) || [];
  for (const c of contacts) {
    if (c.email && c.email.includes("@")) {
      const d = c.email.split("@")[1]?.toLowerCase();
      if (d && !["gmail.com","yahoo.com","hotmail.com","outlook.com","icloud.com"].includes(d)) return d;
    }
  }
  return domainFromUrl(opp.url as string);
}

function costFor(score: number | null, email: string | null): number {
  if (!email || score === null) return 0;
  if (score >= 80) return 1;      // verified
  if (score >= 50) return 1;      // guessed (kept at 1 unit; UI shows amber)
  return 0;
}

async function callHunter(domain: string, first: string, last: string, apiKey: string) {
  const url = `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(domain)}&first_name=${encodeURIComponent(first)}&last_name=${encodeURIComponent(last)}&api_key=${apiKey}`;
  const r = await fetch(url);
  const j = await r.json();
  if (!r.ok) return { ok: false, error: j?.errors?.[0]?.details || `Hunter ${r.status}` };
  const d = j?.data || {};
  return {
    ok: true,
    email: d.email as string | null,
    score: (d.score ?? null) as number | null,
    verification: (d.verification?.status ?? null) as string | null,
    sources: d.sources || [],
    raw: j,
  };
}

async function domainSearch(domain: string, apiKey: string) {
  const url = `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(domain)}&limit=5&api_key=${apiKey}`;
  const r = await fetch(url);
  if (!r.ok) return [];
  const j = await r.json();
  const emails = (j?.data?.emails || []) as Array<{ value: string; type?: string; first_name?: string; last_name?: string }>;
  const generic = emails.find((e) => e.type === "generic")?.value;
  return generic ? [generic] : [];
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const auth = req.headers.get("Authorization") || "";
    if (!auth.startsWith("Bearer ")) return json({ error: "Unauthorized" }, 401);

    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: auth } } },
    );
    const { data: claims } = await anonClient.auth.getClaims(auth.replace("Bearer ", ""));
    const userId = claims?.claims?.sub;
    if (!userId) return json({ error: "Unauthorized" }, 401);

    const { opportunity_id, contact_index, mode } = await req.json().catch(() => ({}));
    if (!opportunity_id) return json({ error: "opportunity_id required" }, 400);
    const bulk = mode === "bulk";

    const hunterKey = Deno.env.get("HUNTER_API_KEY");
    if (!hunterKey) return json({ error: "HUNTER_API_KEY not configured" }, 500);

    const svc = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Warm-lead gate: opportunity must belong to this user in discovered_opportunities
    // (that table is populated only by the event/PR/podcast discovery pipeline — no cold lists).
    const { data: opp } = await svc.from("discovered_opportunities")
      .select("*").eq("id", opportunity_id).eq("user_id", userId).maybeSingle();
    if (!opp) return json({ error: "not_warm_lead", message: "Hunter enrichment is only available for warm event-based leads from Discover." }, 404);

    const contacts: Contact[] = (opp.contacts || []) as Contact[];
    const domain = pickDomain(opp);
    if (!domain) return json({ error: "no_domain", message: "Could not determine a company domain for this event." }, 400);

    const BULK_MAX = 10;
    const targetIndexes: number[] = bulk
      ? contacts.map((c, i) => (!c.email && c.name && splitName(c.name) ? i : -1)).filter((i) => i >= 0).slice(0, BULK_MAX)
      : (typeof contact_index === "number" ? [contact_index] : []);
    if (targetIndexes.length === 0) return json({ error: "no_targets" }, 400);

    // === Rate limits & daily caps ===
    const PER_USER_DAILY_CAP = 50;
    const GLOBAL_DAILY_CAP = 1000;
    const BURST_WINDOW_SEC = 60;
    const BURST_MAX = 10;

    const today = new Date().toISOString().slice(0, 10);

    // Daily cap check (before spending anything)
    const { data: dailyRow } = await svc.from("hunter_usage_daily")
      .select("lookups").eq("user_id", userId).eq("day", today).maybeSingle();
    const userLookupsToday = dailyRow?.lookups ?? 0;
    if (userLookupsToday >= PER_USER_DAILY_CAP) {
      return json({ error: "rate_limited", scope: "daily_user", message: `Daily limit of ${PER_USER_DAILY_CAP} email lookups reached. Try again tomorrow.`, retry_after: 3600 }, 429);
    }

    const { data: globalRow } = await svc.from("hunter_usage_daily")
      .select("lookups").eq("user_id", "00000000-0000-0000-0000-000000000000").eq("day", today).maybeSingle();
    if ((globalRow?.lookups ?? 0) >= GLOBAL_DAILY_CAP) {
      return json({ error: "rate_limited", scope: "daily_global", message: "System-wide Hunter quota reached for today. Please try again tomorrow.", retry_after: 3600 }, 429);
    }

    // Burst check: count this user's calls in the last 60s from contact_enrichments (created_at)
    const burstSince = new Date(Date.now() - BURST_WINDOW_SEC * 1000).toISOString();
    const { count: recentCalls } = await svc.from("contact_enrichments")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", burstSince);
    if ((recentCalls ?? 0) >= BURST_MAX) {
      return json({ error: "rate_limited", scope: "burst", message: `Please wait a moment — max ${BURST_MAX} lookups per minute.`, retry_after: BURST_WINDOW_SEC }, 429);
    }

    // Clamp target count to remaining daily budget
    const remainingDaily = PER_USER_DAILY_CAP - userLookupsToday;
    if (targetIndexes.length > remainingDaily) targetIndexes.length = remainingDaily;

    // Read balance once up-front for a rough cap; each row re-checks.
    const { data: creditsRow } = await svc.from("user_credits").select("balance").eq("user_id", userId).maybeSingle();
    let balance = creditsRow?.balance ?? 0;

    const results: Array<{
      index: number; name: string; email: string | null; score: number | null;
      verification: string | null; charged: number; cached: boolean; error?: string;
    }> = [];

    for (const idx of targetIndexes) {
      const c = contacts[idx];
      if (!c?.name) continue;
      const parts = splitName(c.name);
      if (!parts) continue;
      const { first, last } = parts;

      // Cache check
      const { data: cached } = await svc.from("contact_enrichments")
        .select("*")
        .filter("first_name", "ilike", first)
        .filter("last_name", "ilike", last)
        .filter("domain", "ilike", domain)
        .maybeSingle();

      if (cached) {
        contacts[idx] = { ...c, email: cached.email || c.email, score: cached.score ?? undefined, verification: cached.verification ?? undefined, enriched_at: cached.created_at };
        results.push({ index: idx, name: c.name, email: cached.email, score: cached.score, verification: cached.verification, charged: 0, cached: true });
        continue;
      }

      // Balance guard (each row could cost up to 1)
      if (balance < 1) {
        results.push({ index: idx, name: c.name, email: null, score: null, verification: null, charged: 0, cached: false, error: "insufficient_balance" });
        break;
      }

      const h = await callHunter(domain, first, last, hunterKey);
      if (!h.ok) {
        results.push({ index: idx, name: c.name, email: null, score: null, verification: null, charged: 0, cached: false, error: h.error });
        continue;
      }

      let email = h.email;
      let score = h.score;
      const verification = h.verification;

      if (!email) {
        const generic = await domainSearch(domain, hunterKey);
        if (generic[0]) { email = generic[0]; score = 0; }
      }

      const charged = costFor(score, email);

      if (charged > 0) {
        const { data: cur } = await svc.from("user_credits").select("balance, total_used").eq("user_id", userId).maybeSingle();
        const curBal = cur?.balance ?? balance;
        const { error: debitErr } = await svc.from("user_credits").update({
          balance: Math.max(0, curBal - charged),
          total_used: (cur?.total_used ?? 0) + charged,
          updated_at: new Date().toISOString(),
        }).eq("user_id", userId);
        if (debitErr) {
          results.push({ index: idx, name: c.name, email: null, score: null, verification: null, charged: 0, cached: false, error: "debit_failed" });
          continue;
        }
        balance = Math.max(0, curBal - charged);
      }

      await svc.from("contact_enrichments").insert({
        user_id: userId,
        opportunity_id,
        first_name: first,
        last_name: last,
        domain,
        email,
        score,
        verification,
        sources: h.sources,
        raw: h.raw,
        charged_units: charged,
      });

      contacts[idx] = { ...c, email: email || c.email, score: score ?? undefined, verification: verification ?? undefined, enriched_at: new Date().toISOString() };
      results.push({ index: idx, name: c.name, email, score, verification, charged, cached: false });
    }

    await svc.from("discovered_opportunities")
      .update({ contacts, updated_at: new Date().toISOString() })
      .eq("id", opportunity_id);

    return json({ results, balance_after: balance, domain });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("discover-enrich-contact", msg);
    return json({ error: msg }, 500);
  }
});
