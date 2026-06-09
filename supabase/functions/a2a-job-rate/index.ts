// POST /v1/jobs/{job_id}/rate — leave 1-5 star rating + optional comment.
import { corsHeaders, json, errorJson, admin, authenticateApiKey } from "../_shared/a2a.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return errorJson("method_not_allowed", "Use POST", 405);

  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const jobId = url.searchParams.get("job_id") || (parts[parts.length - 1] === "rate" ? parts[parts.length - 2] : parts[parts.length - 1]);
  if (!jobId) return errorJson("validation_failed", "Missing job_id", 400);

  let body: { stars?: number; comment?: string } = {};
  try { body = await req.json(); } catch { return errorJson("validation_failed", "Invalid JSON body", 400); }
  const stars = Math.round(Number(body.stars));
  if (!Number.isFinite(stars) || stars < 1 || stars > 5) {
    return errorJson("validation_failed", "stars must be an integer between 1 and 5", 400, "Send { stars: 4, comment?: 'optional' }");
  }
  const comment = body.comment ? String(body.comment).slice(0, 1000) : null;

  const sb = admin();
  const apiKey = await authenticateApiKey(req);
  let userId: string | null = null;
  if (!apiKey) {
    const auth = req.headers.get("authorization") || "";
    const m = auth.match(/^Bearer\s+(.+)$/i);
    if (m) {
      const { data } = await sb.auth.getUser(m[1]);
      if (data?.user) userId = data.user.id;
    }
    if (!userId) return errorJson("unauthorized", "Provide Bearer API key (eak_…) or signed-in user JWT", 401);
  }

  let q = sb.from("a2a_jobs").select("id, agent_id, api_key_id, user_id, status").eq("id", jobId);
  if (apiKey) q = q.eq("api_key_id", apiKey.id);
  else if (userId) q = q.eq("user_id", userId);
  const { data: job } = await q.maybeSingle();
  if (!job) return errorJson("job_not_found", "No job with that id for this caller", 404);
  if (job.status !== "completed") {
    return errorJson("job_not_terminal", `Job status is "${job.status}". Wait until completed to rate.`, 409);
  }

  let partnerId: string | null = null;
  if (job.api_key_id) {
    const { data: p } = await sb.from("a2a_partners").select("id").eq("api_key_id", job.api_key_id).maybeSingle();
    partnerId = p?.id ?? null;
  }

  const { error } = await sb.from("a2a_agent_ratings").insert({
    agent_id: job.agent_id,
    job_id: job.id,
    partner_id: partnerId,
    api_key_id: job.api_key_id,
    rated_by_user_id: userId,
    stars,
    comment,
  });
  if (error) {
    if (error.code === "23505") return errorJson("already_rated", "This job has already been rated", 409);
    return errorJson("internal_error", error.message, 500);
  }

  // Recompute and store rolling average on a2a_agents
  const { data: agg } = await sb.from("a2a_agent_ratings").select("stars").eq("agent_id", job.agent_id);
  if (agg && agg.length > 0) {
    const avg = agg.reduce((s, r) => s + (r.stars || 0), 0) / agg.length;
    await sb.from("a2a_agents").update({ rating: Math.round(avg * 100) / 100 }).eq("agent_id", job.agent_id);
  }

  return json({ ok: true, job_id: jobId, stars, count: agg?.length || 1 }, 201);
});
