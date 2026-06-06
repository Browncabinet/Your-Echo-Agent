// Internal worker — drives an a2a_job forward by one tick.
// Called by pg_cron every minute, and by a2a-agent-hire immediately after hire.
// Auth: requires SUPABASE_SERVICE_ROLE_KEY in the Authorization header.
import { corsHeaders, json, admin, emitCallback } from "../_shared/a2a.ts";

const BATCH_SIZE = 15;

async function callFn(path: string, body: unknown, authHeader?: string) {
  const url = `${Deno.env.get("SUPABASE_URL")}/functions/v1/${path}`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader || `Bearer ${Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")}`,
    },
    body: JSON.stringify(body),
  });
  return res;
}

async function setEvent(sb: ReturnType<typeof admin>, jobId: string, event: string, patch: Record<string, unknown> = {}) {
  await sb.from("a2a_jobs").update({
    last_event: event,
    last_event_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...patch,
  }).eq("id", jobId);
}

async function processJob(jobId: string) {
  const sb = admin();
  const { data: job } = await sb.from("a2a_jobs").select("*").eq("id", jobId).maybeSingle();
  if (!job) return { skipped: "job_not_found" };
  if (job.status === "completed" || job.status === "failed" || job.status === "paused") {
    return { skipped: job.status };
  }

  const { data: agent } = await sb.from("a2a_agents").select("*").eq("agent_id", job.agent_id).maybeSingle();
  const { data: campaign } = await sb.from("campaigns").select("*").eq("id", job.campaign_id).maybeSingle();
  if (!campaign) {
    await setEvent(sb, jobId, "job.failed", { status: "failed", error_message: "campaign_missing" });
    emitCallback(job.callback_url, "job.failed", { job_id: jobId, error: "campaign_missing" });
    return { failed: true };
  }

  const leads: any[] = Array.isArray(campaign.leads) ? campaign.leads : [];
  const emails: any[] = Array.isArray(campaign.emails) ? campaign.emails : [];
  const req = job.request as any || {};
  const camp = req.campaign || {};

  // STAGE 1: find leads
  if (leads.length === 0) {
    await setEvent(sb, jobId, "leads.searching", { status: "running" });
    const query = [camp.niche, ...(camp.target_audience || [])].filter(Boolean).join(" ") || agent?.niche || "B2B leads";
    let foundLeads: any[] = [];
    try {
      const res = await callFn("firecrawl-search", { query, options: { limit: Math.min(camp.volume || 25, 25) } });
      if (res.ok) {
        const data = await res.json();
        const items = (data?.data || data?.web || []).slice(0, camp.volume || 25);
        // Extract emails via extract-leads
        const markdown = items.map((i: any) => `${i.title || ""}\n${i.url || ""}\n${i.markdown || i.description || ""}`).join("\n\n---\n\n");
        if (markdown) {
          const ex = await callFn("extract-leads", { content: markdown, niche: camp.niche, targetAudience: camp.target_audience });
          if (ex.ok) {
            const exd = await ex.json();
            foundLeads = (exd?.leads || []).slice(0, camp.volume || 25);
          }
        }
      }
    } catch (e) {
      console.error("lead search failed", e);
    }
    if (foundLeads.length === 0) {
      // Soft-fail: mark complete with 0 leads
      await setEvent(sb, jobId, "leads.none_found", { status: "completed" });
      emitCallback(job.callback_url, "job.completed", { job_id: jobId, leads_found: 0, reason: "no_leads" });
      return { completed: true, leads: 0 };
    }
    await sb.from("campaigns").update({ leads: foundLeads }).eq("id", job.campaign_id);
    await sb.from("a2a_jobs").update({ leads_total: foundLeads.length }).eq("id", jobId);
    await setEvent(sb, jobId, "leads.found");
    emitCallback(job.callback_url, "leads.found", { job_id: jobId, count: foundLeads.length, leads: foundLeads });
    return { leads_found: foundLeads.length };
  }

  // STAGE 2: generate emails
  if (emails.length === 0) {
    await setEvent(sb, jobId, "emails.generating");
    try {
      const sender = (job.sender_identity as any) || {};
      const res = await callFn("generate-emails", {
        websiteUrl: camp.website_url,
        goal: campaign.goal,
        niche: campaign.niche,
        targetAudience: campaign.target_audience,
        sellingPoints: agent?.persona ? [agent.persona] : [],
        leads: leads.slice(0, 5),
      });
      if (!res.ok) throw new Error(await res.text());
      const data = await res.json();
      const templates = data?.templates || [];
      if (templates.length === 0) throw new Error("no_templates");
      await sb.from("campaigns").update({ emails: templates }).eq("id", job.campaign_id);
      await setEvent(sb, jobId, "emails.ready");
      emitCallback(job.callback_url, "emails.ready", { job_id: jobId, templates });
    } catch (e) {
      console.error("email gen failed", e);
      await setEvent(sb, jobId, "emails.failed", { status: "failed", error_message: String(e) });
      emitCallback(job.callback_url, "job.failed", { job_id: jobId, error: "email_generation_failed" });
      return { failed: true };
    }
    return { emails_generated: true };
  }

  // STAGE 3: send next batch via SMTP if owner has it connected
  const { data: smtp } = await sb
    .from("user_email_settings")
    .select("*")
    .eq("user_id", job.user_id)
    .maybeSingle();

  if (!smtp?.is_connected) {
    // Cannot send without SMTP — pause and notify
    await setEvent(sb, jobId, "smtp.required", { status: "paused", paused_at: new Date().toISOString() });
    emitCallback(job.callback_url, "smtp.required", {
      job_id: jobId,
      message: "Campaign owner must connect Gmail/SMTP to start sending. Job paused.",
    });
    return { paused: "smtp_required" };
  }

  // Check spending cap
  if ((job.spend_cents || 0) >= (job.spending_cap_cents || 0)) {
    await setEvent(sb, jobId, "spend.cap_reached", { status: "completed" });
    emitCallback(job.callback_url, "job.completed", { job_id: jobId, reason: "spend_cap_reached", spend_cents: job.spend_cents });
    return { completed: true };
  }

  // Pick leads not yet sent
  const { data: alreadySent } = await sb
    .from("campaign_sends")
    .select("lead_email")
    .eq("campaign_id", job.campaign_id);
  const sentSet = new Set((alreadySent || []).map((r) => r.lead_email.toLowerCase()));
  const remaining = leads.filter((l: any) => l.email && !sentSet.has(String(l.email).toLowerCase()));
  if (remaining.length === 0) {
    await setEvent(sb, jobId, "job.completed", { status: "completed" });
    emitCallback(job.callback_url, "job.completed", { job_id: jobId, leads_sent: job.leads_sent, spend_cents: job.spend_cents });
    return { completed: true };
  }

  const batch = remaining.slice(0, Math.min(BATCH_SIZE, job.daily_send_cap || 100));
  await setEvent(sb, jobId, "send.batch_start", { status: "running", last_run_at: new Date().toISOString() });

  // Reuse send-campaign-emails by calling as the owning user via service-role-minted JWT is non-trivial;
  // simpler: call SMTP send inline using same helper. We invoke the existing function with a service-role header,
  // which it rejects (needs user JWT). Instead, we directly insert + send here.
  const { SmtpClient } = await import("https://deno.land/x/smtp@v0.7.0/mod.ts");
  const tpl = emails[0] || {};
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  let sentCount = 0;
  const perLeadCost = (agent?.pricing_per_lead_cents as number) || 10;

  for (const lead of batch) {
    if ((job.spend_cents || 0) + sentCount * perLeadCost >= (job.spending_cap_cents || 0)) break;

    const hasVariant = !!(tpl.subjectB && String(tpl.subjectB).trim());
    const variant = hasVariant ? (Math.random() < 0.5 ? "A" : "B") : null;
    const rawSubject = variant === "B" ? tpl.subjectB : tpl.subject;
    const subject = (rawSubject || "")
      .replace(/\{\{name\}\}/g, lead.name || "")
      .replace(/\{\{company\}\}/g, lead.company || "");
    let body = (tpl.body || "")
      .replace(/\{\{name\}\}/g, lead.name || "")
      .replace(/\{\{company\}\}/g, lead.company || "");

    const { data: sendRec } = await sb.from("campaign_sends").insert({
      campaign_id: job.campaign_id,
      user_id: job.user_id,
      lead_email: lead.email,
      lead_name: lead.name || "",
      subject,
      status: "queued",
      variant,
    }).select("id").single();
    const sendId = sendRec?.id;

    if (sendId) {
      const trackBase = `${supabaseUrl}/functions/v1/track`;
      body = body.replace(/href="(https?:\/\/[^"]+)"/g, (_, u) =>
        `href="${trackBase}?id=${sendId}&t=c&url=${encodeURIComponent(u)}"`);
      body = body + `<img src="${trackBase}?id=${sendId}&t=o" width="1" height="1" style="display:none" alt="" />`;
    }

    try {
      const client = new SmtpClient();
      if (smtp.smtp_port === 465) {
        await client.connectTLS({ hostname: smtp.smtp_host, port: smtp.smtp_port, username: smtp.smtp_username, password: smtp.smtp_password });
      } else {
        await client.connect({ hostname: smtp.smtp_host, port: smtp.smtp_port, username: smtp.smtp_username, password: smtp.smtp_password });
      }
      await client.send({
        from: smtp.email_address,
        to: lead.email,
        subject,
        content: body.replace(/\n/g, "<br>"),
        html: body.replace(/\n/g, "<br>"),
      });
      await client.close();

      if (sendId) {
        await sb.from("campaign_sends").update({ status: "sent", sent_at: new Date().toISOString() }).eq("id", sendId);
      }
      sentCount++;
      await sb.from("a2a_ledger").insert({
        job_id: jobId,
        event_type: "email_sent",
        unit_cost_cents: perLeadCost,
        metadata: { lead_email: lead.email, send_id: sendId },
      });
      emitCallback(job.callback_url, "email.sent", { job_id: jobId, lead_email: lead.email, subject, send_id: sendId });
      await new Promise((r) => setTimeout(r, 1000));
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (sendId) {
        await sb.from("campaign_sends").update({ status: "failed", error_message: msg }).eq("id", sendId);
      }
      emitCallback(job.callback_url, "email.failed", { job_id: jobId, lead_email: lead.email, error: msg });
    }
  }

  await sb.from("a2a_jobs").update({
    leads_sent: (job.leads_sent || 0) + sentCount,
    spend_cents: (job.spend_cents || 0) + sentCount * perLeadCost,
    last_event: "send.batch_done",
    last_event_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).eq("id", jobId);

  // If we just sent the last lead, complete
  if (remaining.length <= batch.length) {
    await setEvent(sb, jobId, "job.completed", { status: "completed" });
    emitCallback(job.callback_url, "job.completed", {
      job_id: jobId,
      leads_sent: (job.leads_sent || 0) + sentCount,
      spend_cents: (job.spend_cents || 0) + sentCount * perLeadCost,
    });
  }

  return { sent: sentCount };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  // Auth: service-role (direct kick from hire/control) OR anon-key (cron tick).
  // For explicit job_id calls, we require service-role.
  const auth = req.headers.get("authorization") || "";
  const token = auth.replace(/^Bearer\s+/i, "").trim();
  const isServiceRole = token === Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const isAnon = token === Deno.env.get("SUPABASE_ANON_KEY");
  if (!isServiceRole && !isAnon) return json({ error: "unauthorized" }, 401);

  let body: { job_id?: string; tick?: boolean } = {};
  try { body = await req.json(); } catch {}

  if (body.job_id) {
    if (!isServiceRole) return json({ error: "service_role_required_for_job_id" }, 403);
    const result = await processJob(body.job_id);
    return json({ ok: true, job_id: body.job_id, result });
  }


  // Tick mode: pick all running/queued jobs and step each
  const sb = admin();
  const { data: jobs } = await sb
    .from("a2a_jobs")
    .select("id")
    .in("status", ["queued", "running"])
    .order("updated_at", { ascending: true })
    .limit(10);

  const results: any[] = [];
  for (const j of jobs || []) {
    try {
      const r = await processJob(j.id);
      results.push({ job_id: j.id, ...r });
    } catch (e) {
      results.push({ job_id: j.id, error: String(e) });
    }
  }
  return json({ ok: true, processed: results.length, results });
});
