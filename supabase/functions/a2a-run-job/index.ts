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

  // Pick leads not yet sent and not unsubscribed
  const { data: alreadySent } = await sb
    .from("campaign_sends")
    .select("lead_email")
    .eq("campaign_id", job.campaign_id);
  const sentSet = new Set((alreadySent || []).map((r) => r.lead_email.toLowerCase()));

  const leadEmailsLower = leads.map((l: any) => String(l.email || "").toLowerCase()).filter(Boolean);
  const { data: unsubs } = await sb.from("unsubscribes").select("email").eq("user_id", job.user_id).in("email", leadEmailsLower);
  const unsubSet = new Set((unsubs || []).map((u: any) => u.email));

  const remaining = leads.filter((l: any) => l.email && !sentSet.has(String(l.email).toLowerCase()) && !unsubSet.has(String(l.email).toLowerCase()));

  if (remaining.length === 0) {
    await setEvent(sb, jobId, "job.completed", { status: "completed" });
    emitCallback(job.callback_url, "job.completed", { job_id: jobId, leads_sent: job.leads_sent, spend_cents: job.spend_cents });
    return { completed: true };
  }

  const batch = remaining.slice(0, Math.min(BATCH_SIZE, job.daily_send_cap || 100));
  await setEvent(sb, jobId, "send.batch_start", { status: "running", last_run_at: new Date().toISOString() });

  const { SmtpClient } = await import("https://deno.land/x/smtp@v0.7.0/mod.ts");
  const tpl = emails[0] || {};
  const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
  let sentCount = 0;
  const perLeadCost = (agent?.pricing_per_lead_cents as number) || 10;

  // Per-recipient-domain daily throttle (default 50/day)
  const today = new Date().toISOString().slice(0, 10);
  const throttleCache = new Map<string, { sends_today: number; daily_cap: number }>();
  const getThrottle = async (domain: string) => {
    if (throttleCache.has(domain)) return throttleCache.get(domain)!;
    const { data } = await sb.from("domain_throttle")
      .select("sends_today, daily_cap, send_date")
      .eq("user_id", job.user_id).eq("domain", domain).maybeSingle();
    const row = data && data.send_date === today
      ? { sends_today: data.sends_today, daily_cap: data.daily_cap }
      : { sends_today: 0, daily_cap: 50 };
    throttleCache.set(domain, row);
    return row;
  };
  const bumpThrottle = async (domain: string) => {
    const row = throttleCache.get(domain)!;
    row.sends_today += 1;
    throttleCache.set(domain, row);
    await sb.from("domain_throttle").upsert({
      user_id: job.user_id, domain, send_date: today,
      sends_today: row.sends_today, daily_cap: row.daily_cap,
      last_sent_at: new Date().toISOString(),
    }, { onConflict: "user_id,domain,send_date" });
  };

  // Warm-up enforcement per sender domain
  const senderDomain = String(smtp.email_address || "").split("@")[1]?.toLowerCase() || "";
  let warmup: { day_index: number; daily_limit: number; sent_today: number } | null = null;
  if (senderDomain) {
    const { data: wrow } = await sb.from("sender_warmup")
      .select("day_index, daily_limit, sent_today, last_sent_date")
      .eq("user_id", job.user_id).eq("domain", senderDomain).maybeSingle();
    if (!wrow) {
      warmup = { day_index: 1, daily_limit: 20, sent_today: 0 };
      await sb.from("sender_warmup").insert({
        user_id: job.user_id, domain: senderDomain,
        day_index: 1, daily_limit: 20, sent_today: 0, last_sent_date: today,
      });
    } else if (wrow.last_sent_date && wrow.last_sent_date < today) {
      const newDay = (wrow.day_index || 1) + 1;
      const newLimit = Math.min(20 + (newDay - 1) * 20, 200);
      warmup = { day_index: newDay, daily_limit: newLimit, sent_today: 0 };
      await sb.from("sender_warmup").update({
        day_index: newDay, daily_limit: newLimit, sent_today: 0, last_sent_date: today,
      }).eq("user_id", job.user_id).eq("domain", senderDomain);
    } else {
      warmup = { day_index: wrow.day_index, daily_limit: wrow.daily_limit, sent_today: wrow.sent_today };
    }
  }
  const bumpWarmup = async () => {
    if (!warmup || !senderDomain) return;
    warmup.sent_today += 1;
    await sb.from("sender_warmup").update({
      sent_today: warmup.sent_today, last_sent_date: today,
    }).eq("user_id", job.user_id).eq("domain", senderDomain);
  };

  for (const lead of batch) {
    if ((job.spend_cents || 0) + sentCount * perLeadCost >= (job.spending_cap_cents || 0)) break;

    const recipientDomain = String(lead.email || "").split("@")[1]?.toLowerCase() || "";
    if (recipientDomain) {
      const t = await getThrottle(recipientDomain);
      if (t.sends_today >= t.daily_cap) {
        await sb.from("campaign_sends").insert({
          campaign_id: job.campaign_id, user_id: job.user_id,
          lead_email: lead.email, lead_name: lead.name || "",
          subject: "", status: "queued_throttled",
          error_message: `Daily cap reached for ${recipientDomain}`,
        });
        continue;
      }
    }
    if (warmup && warmup.sent_today >= warmup.daily_limit) {
      await sb.from("campaign_sends").insert({
        campaign_id: job.campaign_id, user_id: job.user_id,
        lead_email: lead.email, lead_name: lead.name || "",
        subject: "", status: "queued_warmup",
        error_message: `Warm-up day ${warmup.day_index}: ${warmup.sent_today}/${warmup.daily_limit} sent`,
      });
      continue;
    }

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
      body = body + `<br><br><p style="font-size:11px;color:#94A3B8;text-align:center;margin-top:24px">You're receiving this from ${smtp.email_address}. <a href="${supabaseUrl}/functions/v1/unsubscribe?u=${sendId}" style="color:#94A3B8">Unsubscribe</a>.</p>`;
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
      if (recipientDomain) await bumpThrottle(recipientDomain);
      await bumpWarmup();
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
      const isHardBounce = /\b5\d\d\b|user unknown|no such user|mailbox unavailable|address rejected/i.test(msg);
      const isComplaint = /complaint|spam/i.test(msg);
      if (sendId) {
        await sb.from("campaign_sends").update({ status: isHardBounce ? "bounced" : "failed", error_message: msg }).eq("id", sendId);
        await sb.from("bounce_events").insert({
          user_id: job.user_id, send_id: sendId, lead_email: lead.email,
          bounce_type: isComplaint ? "complaint" : (isHardBounce ? "hard" : "soft"),
          reason: msg.slice(0, 500),
        });
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

  // Bill the partner for these sends (no-op for human-flow jobs)
  if (sentCount > 0 && job.api_key_id) {
    try {
      const billRes = await callFn("a2a-billing-charge", { job_id: jobId });
      if (!billRes.ok) console.error("billing-charge failed", await billRes.text());
    } catch (e) {
      console.error("billing-charge error", e);
    }
  }

  // If we just sent the last lead, complete (unless billing paused us)
  const { data: updatedJob } = await sb.from("a2a_jobs").select("status").eq("id", jobId).maybeSingle();
  if (updatedJob?.status !== "paused" && remaining.length <= batch.length) {
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
