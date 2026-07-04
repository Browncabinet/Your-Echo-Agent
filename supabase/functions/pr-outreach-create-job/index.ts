// Persist a set of drafted PR outreach emails as a job for the ECHO_API_KEY owner.
// Users approve + send from the Echo Agent dashboard (existing send pipeline).
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { admin, authenticateApiKey, corsHeaders, errorJson, json } from "../_shared/a2a.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return errorJson("method_not_allowed", "POST only", 405);
  try {
    const apiKey = await authenticateApiKey(req);
    if (!apiKey) return errorJson("unauthorized", "Valid ECHO_API_KEY required (Bearer eak_...)", 401);

    const body = await req.json().catch(() => ({}));
    const {
      sender_identity,
      groups,
      niche,
      category,
      spending_cap_cents,
      notes,
    } = body ?? {};

    if (!sender_identity?.name || !sender_identity?.email) {
      return errorJson("bad_request", "sender_identity.name and sender_identity.email required", 400);
    }
    if (!Array.isArray(groups) || groups.length === 0) {
      return errorJson("bad_request", "groups array (from pr-outreach-draft) required", 400);
    }

    // Flatten drafts + count
    const flatDrafts: any[] = [];
    for (const g of groups) {
      if (!Array.isArray(g?.drafts)) continue;
      for (const d of g.drafts) {
        if (!d?.to?.email || !d?.subject || !d?.body) continue;
        flatDrafts.push({
          source_title: g.source_title ?? null,
          source_url: g.source_url ?? null,
          category: g.category ?? null,
          to: d.to,
          subject: String(d.subject).slice(0, 140),
          body: String(d.body).slice(0, 4000),
          reply_to: d.reply_to ?? sender_identity.email,
          meeting_options: Array.isArray(d.meeting_options) ? d.meeting_options : ["phone", "online"],
          status: "pending_review",
        });
      }
    }
    if (flatDrafts.length === 0) return errorJson("bad_request", "no valid drafts found in groups", 400);

    // Find the partner (user_id) tied to this API key
    const sb = admin();
    const { data: keyRow } = await sb
      .from("a2a_api_keys")
      .select("id, partner_id")
      .eq("id", apiKey.id)
      .maybeSingle();
    const partnerId = keyRow?.partner_id ?? null;

    let userId: string | null = null;
    if (partnerId) {
      const { data: partner } = await sb
        .from("a2a_partners")
        .select("owner_user_id")
        .eq("id", partnerId)
        .maybeSingle();
      userId = partner?.owner_user_id ?? null;
    }

    const { data: inserted, error } = await sb
      .from("pr_outreach_jobs")
      .insert({
        user_id: userId,
        a2a_partner_id: partnerId,
        a2a_api_key_id: apiKey.id,
        sender_identity,
        niche: niche ?? null,
        category: category ?? null,
        drafts: flatDrafts,
        total_drafts: flatDrafts.length,
        spending_cap_cents: spending_cap_cents ?? null,
        notes: notes ?? null,
        status: "awaiting_approval",
      })
      .select("id, status, total_drafts, created_at")
      .maybeSingle();

    if (error) return errorJson("insert_failed", error.message, 500);

    const dashboardUrl = `https://yourechoagent.com/for-agents/dashboard?pr_job=${inserted?.id ?? ""}`;
    return json({
      job_id: inserted?.id,
      status: inserted?.status,
      total_drafts: inserted?.total_drafts,
      created_at: inserted?.created_at,
      approve_and_send_url: dashboardUrl,
      message: `Saved ${flatDrafts.length} drafts. Approve & send them from ${dashboardUrl}. Every send uses your verified sender identity, respects weekly caps, and honors the suppression list.`,
    });
  } catch (e) {
    return errorJson("server_error", (e as Error).message, 500);
  }
});
