// Cron-driven webhook retry worker. Picks queue rows where status='pending' and
// next_attempt_at <= now(), re-POSTs them, updates status / next attempt.
import { corsHeaders, json, admin, isSafeCallbackUrl } from "../_shared/a2a.ts";

const RETRY_DELAYS_SEC = [60, 300, 1800, 7200, 43200];

function nextAttemptISO(attempt: number): string {
  const sec = RETRY_DELAYS_SEC[Math.min(attempt - 1, RETRY_DELAYS_SEC.length - 1)];
  return new Date(Date.now() + sec * 1000).toISOString();
}

async function processOne(row: Record<string, any>) {
  const sb = admin();

  const safe = await isSafeCallbackUrl(row.callback_url);
  if (!safe.ok) {
    await sb.from("a2a_callback_queue").update({
      status: "failed_permanent",
      last_error: `ssrf_blocked:${safe.reason}`,
      updated_at: new Date().toISOString(),
    }).eq("id", row.id);
    return { id: row.id, result: "ssrf_blocked" };
  }

  const body = JSON.stringify(row.payload);
  let status: number | null = null;
  let errMsg: string | null = null;
  try {
    const res = await fetch(row.callback_url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Echo-Signature": `sha256=${row.signature}`,
        "X-Echo-Event": row.event_type,
        "X-Echo-Attempt": String(row.attempt + 1),
      },
      body,
      signal: AbortSignal.timeout(10_000),
    });
    status = res.status;
  } catch (e) {
    errMsg = e instanceof Error ? e.message : String(e);
  }

  const delivered = status !== null && status >= 200 && status < 300;
  const nextAttempt = row.attempt + 1;

  if (delivered) {
    await sb.from("a2a_callback_queue").update({
      status: "delivered",
      attempt: nextAttempt,
      last_status_code: status,
      last_error: null,
      updated_at: new Date().toISOString(),
    }).eq("id", row.id);
    // Mirror to log
    if (row.callback_log_id) {
      await sb.from("a2a_callbacks_log").update({
        delivered: true, response_status: status, error_message: null,
      }).eq("id", row.callback_log_id);
    }
    return { id: row.id, result: "delivered" };
  }

  if (nextAttempt >= (row.max_attempts || 5)) {
    await sb.from("a2a_callback_queue").update({
      status: "failed_permanent",
      attempt: nextAttempt,
      last_status_code: status,
      last_error: errMsg || `http_${status}`,
      updated_at: new Date().toISOString(),
    }).eq("id", row.id);
    return { id: row.id, result: "failed_permanent" };
  }

  await sb.from("a2a_callback_queue").update({
    attempt: nextAttempt,
    next_attempt_at: nextAttemptISO(nextAttempt),
    last_status_code: status,
    last_error: errMsg || `http_${status}`,
    updated_at: new Date().toISOString(),
  }).eq("id", row.id);
  return { id: row.id, result: "retry_scheduled" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const sb = admin();
  const { data, error } = await sb
    .from("a2a_callback_queue")
    .select("*")
    .eq("status", "pending")
    .lte("next_attempt_at", new Date().toISOString())
    .order("next_attempt_at", { ascending: true })
    .limit(25);
  if (error) return json({ error: error.message }, 500);

  const results: any[] = [];
  for (const row of data || []) {
    try { results.push(await processOne(row)); }
    catch (e) { results.push({ id: row.id, error: String(e) }); }
  }
  return json({ ok: true, processed: results.length, results });
});
