// POST /v1/jobs/{job_id}/pause | /resume | /cancel
import { corsHeaders, json, admin, authenticateApiKey, emitCallback } from "../_shared/a2a.ts";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const url = new URL(req.url);
  const parts = url.pathname.split("/").filter(Boolean);
  const action = parts[parts.length - 1]; // "pause" | "resume" | "cancel"
  const jobId = url.searchParams.get("job_id") || parts[parts.length - 2];
  if (!jobId || (action !== "pause" && action !== "resume" && action !== "cancel")) {
    return json({ error: "expects /a2a-job-control/{job_id}/{pause|resume|cancel}" }, 400);
  }

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
  const { data: job } = await q.maybeSingle();
  if (!job) return json({ error: "job_not_found" }, 404);

  // Cancel is terminal — no resume from here
  if (action === "cancel") {
    if (job.status === "completed" || job.status === "cancelled" || job.status === "failed") {
      return json({ error: "job_already_terminal", status: job.status }, 409);
    }
    await sb.from("a2a_jobs").update({
      status: "cancelled",
      last_event: "job.cancelled",
      last_event_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }).eq("id", jobId);

    if (job.campaign_id) {
      await sb.from("campaigns").update({
        status: "paused",
        updated_at: new Date().toISOString(),
      }).eq("id", job.campaign_id);
    }

    await emitCallback(job.callback_url, "job.cancelled", { job_id: jobId, status: "cancelled" });
    return json({ ok: true, job_id: jobId, status: "cancelled" });
  }

  const newStatus = action === "pause" ? "paused" : "running";
  await sb.from("a2a_jobs").update({
    status: newStatus,
    paused_at: action === "pause" ? new Date().toISOString() : null,
    last_event: `job.${action}d`,
    last_event_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", jobId);

  // Mirror to campaign status
  if (job.campaign_id) {
    await sb.from("campaigns").update({
      status: action === "pause" ? "paused" : "active",
      updated_at: new Date().toISOString(),
    }).eq("id", job.campaign_id);
  }

  await emitCallback(job.callback_url, `job.${action}d`, { job_id: jobId, status: newStatus });

  // If resuming, kick the worker immediately
  if (action === "resume") {
    try {
      fetch(`${Deno.env.get("SUPABASE_URL")}/functions/v1/a2a-run-job`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
        },
        body: JSON.stringify({ job_id: jobId }),
      });
    } catch {}
  }

  return json({ ok: true, job_id: jobId, status: newStatus });
});
