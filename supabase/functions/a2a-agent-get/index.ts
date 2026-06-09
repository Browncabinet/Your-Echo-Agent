// GET /v1/agents/{agent_id} — Agent Card
import { corsHeaders, json, errorJson, admin, toAgentCard, publicBaseUrl } from "../_shared/a2a.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return errorJson("method_not_allowed", "Use GET", 405);

  const url = new URL(req.url);
  const agentId = url.searchParams.get("agent_id") || url.pathname.split("/").pop();
  if (!agentId) return errorJson("validation_failed", "Missing agent_id", 400);

  const sb = admin();
  const { data, error } = await sb
    .from("a2a_agents")
    .select("*")
    .eq("agent_id", agentId)
    .eq("active", true)
    .maybeSingle();
  if (error) return errorJson("internal_error", error.message, 500);
  if (!data) return errorJson("agent_not_found", "No active agent with that id", 404);

  const { data: ratings } = await sb.from("a2a_agent_ratings").select("stars").eq("agent_id", agentId);
  const agg = ratings && ratings.length > 0
    ? { avg: ratings.reduce((s, r) => s + (r.stars || 0), 0) / ratings.length, count: ratings.length }
    : undefined;

  return json(toAgentCard(data, publicBaseUrl(req), agg));
});

