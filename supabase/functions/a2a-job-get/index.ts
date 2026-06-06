// GET /v1/jobs/{job_id}
import { corsHeaders, json, admin, authenticateApiKey } from "../_shared/a2a.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "GET") return json({ error: "method_not_allowed" }, 405);

  const url = new URL(req.url);
  const jobId = url.searchParams.get("job_id") || url.pathname.split("/").pop();
  if (!jobId) return json({ error: "missing job_id" }, 400);

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
    if (!userId) return json({ error: "unauthorized" }, 401);
  }

  let q = sb.from("a2a_jobs").select("*").eq("id", jobId);
  if (apiKey) q = q.eq("api_key_id", apiKey.id);
  else if (userId) q = q.eq("user_id", userId);
  const { data: job, error } = await q.maybeSingle();
  if (error) return json({ error: error.message }, 500);
  if (!job) return json({ error: "job_not_found" }, 404);

  // Pull live counts from campaign_sends
  const { data: sends } = await sb
    .from("campaign_sends")
    .select("status, opened_at, clicked_at")
    .eq("campaign_id", job.campaign_id);
  const counts = {
    emails_queued: sends?.filter((s) => s.status === "queued").length || 0,
    emails_sent: sends?.filter((s) => s.status === "sent").length || 0,
    emails_opened: sends?.filter((s) => !!s.opened_at).length || 0,
    emails_clicked: sends?.filter((s) => !!s.clicked_at).length || 0,
  };

  return json({
    job_id: job.id,
    agent_id: job.agent_id,
    campaign_id: job.campaign_id,
    status: job.status,
    source: job.source,
    spend_cents: job.spend_cents,
    spending_cap_cents: job.spending_cap_cents,
    estimated_cost_cents: job.estimated_cost_cents,
    results: { ...job.results_summary, ...counts },
    created_at: job.created_at,
    updated_at: job.updated_at,
  });
});
