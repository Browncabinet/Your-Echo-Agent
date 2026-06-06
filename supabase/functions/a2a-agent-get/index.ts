// GET /v1/agents/{agent_id} — Agent Card
import { corsHeaders, json, admin, toAgentCard, publicBaseUrl } from "../_shared/a2a.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  const url = new URL(req.url);
  const agentId = url.searchParams.get("agent_id") || url.pathname.split("/").pop();
  if (!agentId) return json({ error: "missing agent_id" }, 400);

  const { data, error } = await admin()
    .from("a2a_agents")
    .select("*")
    .eq("agent_id", agentId)
    .eq("active", true)
    .maybeSingle();
  if (error) return json({ error: error.message }, 500);
  if (!data) return json({ error: "agent_not_found" }, 404);

  return json(toAgentCard(data, publicBaseUrl(req)));
});
