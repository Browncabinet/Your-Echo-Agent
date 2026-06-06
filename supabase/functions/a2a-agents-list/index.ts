// GET /v1/agents — list available Echo Agents
import { corsHeaders, json, admin, toAgentCard, publicBaseUrl } from "../_shared/a2a.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  const url = new URL(req.url);
  const niche = url.searchParams.get("niche");
  const capability = url.searchParams.get("capability");

  let q = admin().from("a2a_agents").select("*").eq("active", true);
  if (niche) q = q.ilike("niche", `%${niche}%`);

  const { data, error } = await q;
  if (error) return json({ error: error.message }, 500);

  let agents = (data || []).map((a) => toAgentCard(a, publicBaseUrl(req)));
  if (capability) {
    agents = agents.filter((a) =>
      Array.isArray(a.capabilities) && (a.capabilities as string[]).includes(capability)
    );
  }

  return json({ object: "list", count: agents.length, agents });
});
