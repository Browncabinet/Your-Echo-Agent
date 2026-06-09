// GET /v1/agents — list available Echo Agents
import { corsHeaders, json, admin, toAgentCard, publicBaseUrl } from "../_shared/a2a.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  const url = new URL(req.url);
  const niche = url.searchParams.get("niche");
  const capability = url.searchParams.get("capability");

  const sb = admin();
  let q = sb.from("a2a_agents").select("*").eq("active", true);
  if (niche) q = q.ilike("niche", `%${niche}%`);
  const { data, error } = await q;
  if (error) return json({ error: error.message }, 500);

  // Pull rating aggregates per agent in one shot
  const { data: ratings } = await sb.from("a2a_agent_ratings").select("agent_id, stars");
  const aggMap = new Map<string, { sum: number; count: number }>();
  for (const r of ratings || []) {
    const cur = aggMap.get(r.agent_id) || { sum: 0, count: 0 };
    cur.sum += r.stars; cur.count += 1;
    aggMap.set(r.agent_id, cur);
  }

  const base = publicBaseUrl(req);
  let agents = (data || []).map((a) => {
    const agg = aggMap.get(a.agent_id as string);
    return toAgentCard(a, base, agg ? { avg: agg.sum / agg.count, count: agg.count } : undefined);
  });
  if (capability) {
    agents = agents.filter((a) =>
      Array.isArray(a.capabilities) && (a.capabilities as string[]).includes(capability)
    );
  }

  return json({ object: "list", count: agents.length, agents });
});

