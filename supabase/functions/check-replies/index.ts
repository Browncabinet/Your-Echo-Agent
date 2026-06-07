import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAX_BATCH_SIZE = 50;
const SEARCH_WINDOW_DAYS = 14;

// ─── IMAP helpers (raw TLS, defensive) ───────────────────────────────────────

async function imapCommand(
  conn: Deno.TlsConn,
  tag: string,
  command: string
): Promise<string> {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  await conn.write(encoder.encode(`${tag} ${command}\r\n`));

  let response = "";
  const buf = new Uint8Array(8192);
  const deadline = Date.now() + 15_000; // 15s timeout per command

  while (Date.now() < deadline) {
    const n = await conn.read(buf);
    if (n === null) break;
    response += decoder.decode(buf.subarray(0, n));
    // Check for tagged completion
    if (
      response.includes(`${tag} OK`) ||
      response.includes(`${tag} NO`) ||
      response.includes(`${tag} BAD`)
    ) {
      break;
    }
  }

  if (response.includes(`${tag} NO`) || response.includes(`${tag} BAD`)) {
    throw new Error(`IMAP error for "${command}": ${response.trim()}`);
  }

  return response;
}

async function connectIMAP(
  host: string,
  username: string,
  password: string
): Promise<Deno.TlsConn> {
  let conn: Deno.TlsConn;

  try {
    conn = await Deno.connectTls({ hostname: host, port: 993 });
  } catch (err) {
    throw new Error(
      `Could not connect to ${host} — please verify your App Password or try again later. (${
        err instanceof Error ? err.message : String(err)
      })`
    );
  }

  // Read greeting
  const buf = new Uint8Array(4096);
  const decoder = new TextDecoder();
  const n = await conn.read(buf);
  if (n === null) throw new Error("No IMAP greeting received");
  const greeting = decoder.decode(buf.subarray(0, n));
  if (!greeting.includes("OK")) {
    throw new Error(`Unexpected IMAP greeting: ${greeting.trim()}`);
  }

  // Login
  try {
    await imapCommand(conn, "A001", `LOGIN "${username}" "${password}"`);
  } catch {
    conn.close();
    throw new Error(
      "Gmail login failed — please verify your App Password is correct and that IMAP is enabled in Gmail settings."
    );
  }

  return conn;
}

interface RawEmail {
  from: string;
  subject: string;
  body: string;
  date: string;
}

function parseEmailAddress(raw: string): string {
  const match = raw.match(/<([^>]+)>/);
  return match ? match[1].toLowerCase() : raw.trim().toLowerCase();
}

function parseFetchResponse(raw: string): RawEmail | null {
  try {
    const fromMatch = raw.match(/^From:\s*(.+)$/im);
    const subjectMatch = raw.match(/^Subject:\s*(.+)$/im);
    const dateMatch = raw.match(/^Date:\s*(.+)$/im);

    // Extract body: everything after the first blank line in the message
    const headerEnd = raw.indexOf("\r\n\r\n");
    let body = "";
    if (headerEnd !== -1) {
      body = raw
        .substring(headerEnd + 4)
        .replace(/\)\r?\n.*$/, "") // trim IMAP closing
        .trim();
    }

    return {
      from: fromMatch ? parseEmailAddress(fromMatch[1]) : "",
      subject: subjectMatch ? subjectMatch[1].trim() : "(no subject)",
      body: body.substring(0, 2000), // cap body length
      date: dateMatch ? dateMatch[1].trim() : new Date().toISOString(),
    };
  } catch {
    return null;
  }
}

async function fetchReplies(
  conn: Deno.TlsConn,
  leadEmails: string[]
): Promise<RawEmail[]> {
  // Select INBOX
  await imapCommand(conn, "A002", "SELECT INBOX");

  // Build date for SINCE filter (14 days ago)
  const since = new Date();
  since.setDate(since.getDate() - SEARCH_WINDOW_DAYS);
  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];
  const sinceStr = `${since.getDate()}-${months[since.getMonth()]}-${since.getFullYear()}`;

  const allEmails: RawEmail[] = [];

  // Batch lead emails in groups of MAX_BATCH_SIZE
  for (let i = 0; i < leadEmails.length; i += MAX_BATCH_SIZE) {
    const batch = leadEmails.slice(i, i + MAX_BATCH_SIZE);

    // Build OR-chain for FROM addresses
    const fromCriteria = batch.map((e) => `FROM "${e}"`);
    let searchQuery: string;
    if (fromCriteria.length === 1) {
      searchQuery = `SEARCH SINCE ${sinceStr} ${fromCriteria[0]}`;
    } else {
      // IMAP OR syntax: OR (crit1) (crit2), nested for 3+
      let combined = fromCriteria[fromCriteria.length - 1];
      for (let j = fromCriteria.length - 2; j >= 0; j--) {
        combined = `OR ${fromCriteria[j]} ${combined}`;
      }
      searchQuery = `SEARCH SINCE ${sinceStr} ${combined}`;
    }

    const tagSearch = `B${String(i).padStart(3, "0")}`;
    const searchResult = await imapCommand(conn, tagSearch, searchQuery);

    // Parse message UIDs from SEARCH response
    const searchLine = searchResult
      .split("\n")
      .find((l) => l.includes("* SEARCH"));
    if (!searchLine) continue;

    const uids = searchLine
      .replace("* SEARCH", "")
      .trim()
      .split(/\s+/)
      .filter((s) => s.match(/^\d+$/));

    if (uids.length === 0) continue;

    // Fetch each message (limit to 100 to prevent overload)
    const fetchUids = uids.slice(0, 100);
    for (const uid of fetchUids) {
      const tagFetch = `C${uid.padStart(4, "0")}`;
      try {
        const fetchResult = await imapCommand(
          conn,
          tagFetch,
          `FETCH ${uid} (BODY[HEADER.FIELDS (FROM SUBJECT DATE)] BODY[TEXT])`
        );
        const parsed = parseFetchResponse(fetchResult);
        if (parsed && parsed.from) {
          allEmails.push(parsed);
        }
      } catch {
        // Skip individual message fetch errors
        continue;
      }
    }
  }

  return allEmails;
}

// ─── AI Classification ──────────────────────────────────────────────────────

async function classifyReply(
  subject: string,
  body: string,
  schedulingLink: string
): Promise<{
  classification: string;
  draftReply: string;
  suggestedAction: string;
  intentScore: number;
  suggestedReply: string;
}> {
  const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
  if (!lovableApiKey) return keywordClassify(subject, body);

  try {
    const prompt = `Classify this email reply and draft a response.

EMAIL SUBJECT: ${subject}
EMAIL BODY: ${body}

CLASSIFICATIONS:
- "interested" — wants to learn more, agrees to meet
- "not_interested" — declines, says no
- "unsubscribe" — asks to be removed, stop emailing
- "wrong_person" — wrong contact, forwarded elsewhere
- "question" — asks question / wants info
- "objection" — concern, pushback, price issue
- "needs_info" — wants more details before deciding

RESPONSE FORMAT (JSON only, no markdown):
{
  "classification": "interested|not_interested|unsubscribe|wrong_person|question|objection|needs_info",
  "intent_score": 0-100,
  "draftReply": "Natural 2-4 sentence reply${schedulingLink ? `. If interested, include this scheduling link: ${schedulingLink}` : ""}",
  "suggestedReply": "A polished, ready-to-send reply tailored to their message (3-5 sentences)",
  "suggestedAction": "Brief action item"
}`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${lovableApiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      }),
    });
    if (!response.ok) return keywordClassify(subject, body);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return {
        classification: parsed.classification || "unknown",
        draftReply: parsed.draftReply || "",
        suggestedAction: parsed.suggestedAction || "",
        intentScore: Math.max(0, Math.min(100, Number(parsed.intent_score) || 0)),
        suggestedReply: parsed.suggestedReply || parsed.draftReply || "",
      };
    }
    return keywordClassify(subject, body);
  } catch (err) {
    console.error("AI classification error:", err);
    return keywordClassify(subject, body);
  }
}

function keywordClassify(_subject: string, body: string) {
  const lower = body.toLowerCase();
  const base = { draftReply: "", suggestedReply: "" };
  if (lower.includes("unsubscribe") || lower.includes("remove me") || lower.includes("stop emailing"))
    return { ...base, classification: "unsubscribe", suggestedAction: "Suppress this lead", intentScore: 0 };
  if (lower.includes("not interested"))
    return { ...base, classification: "not_interested", suggestedAction: "Remove from future campaigns", intentScore: 5 };
  if (lower.includes("wrong person") || lower.includes("not the right"))
    return { ...base, classification: "wrong_person", suggestedAction: "Find the right contact", intentScore: 10 };
  if (lower.includes("interested") || lower.includes("schedule") || lower.includes("let's talk") || lower.includes("sounds good"))
    return { ...base, classification: "interested", suggestedAction: "Send a meeting invite", intentScore: 80 };
  if (lower.includes("?") || lower.includes("how") || lower.includes("what") || lower.includes("tell me more"))
    return { ...base, classification: "question", suggestedAction: "Answer their question", intentScore: 55 };
  if (lower.includes("too expensive") || lower.includes("concern") || lower.includes("not sure"))
    return { ...base, classification: "objection", suggestedAction: "Address their concern", intentScore: 40 };
  return { ...base, classification: "unknown", suggestedAction: "Review manually", intentScore: 20 };
}


// ─── Main handler ────────────────────────────────────────────────────────────

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Auth
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = claimsData.claims.sub as string;

    // Get email settings
    const { data: settings, error: settingsError } = await supabase
      .from("user_email_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (settingsError || !settings?.is_connected) {
      return new Response(
        JSON.stringify({
          error:
            "Email not connected. Please connect your Gmail with an App Password first.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get campaign_id from request (optional — if not provided, check all campaigns)
    const body = await req.json().catch(() => ({}));
    const campaignFilter = body.campaign_id || null;

    // Get user's campaigns to find lead emails
    let campaignsQuery = supabase
      .from("campaigns")
      .select("id, leads, name")
      .eq("user_id", userId);

    if (campaignFilter) {
      campaignsQuery = campaignsQuery.eq("id", campaignFilter);
    }

    const { data: campaigns, error: campaignsError } = await campaignsQuery;

    if (campaignsError || !campaigns?.length) {
      return new Response(
        JSON.stringify({
          error: "No campaigns found. Create a campaign with leads first.",
          replies: [],
          checked_at: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Collect unique lead emails across campaigns (with campaign mapping)
    const emailToCampaign: Record<string, { campaignId: string; leadName: string }> = {};
    for (const campaign of campaigns) {
      const leads = Array.isArray(campaign.leads) ? campaign.leads : [];
      for (const lead of leads as { email?: string; name?: string }[]) {
        if (lead.email) {
          emailToCampaign[lead.email.toLowerCase()] = {
            campaignId: campaign.id,
            leadName: lead.name || "",
          };
        }
      }
    }

    const leadEmails = Object.keys(emailToCampaign);
    if (leadEmails.length === 0) {
      return new Response(
        JSON.stringify({
          replies: [],
          new_count: 0,
          checked_at: new Date().toISOString(),
          message: "No lead emails found in your campaigns.",
        }),
        {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Connect to IMAP and fetch replies
    let conn: Deno.TlsConn | null = null;
    let rawEmails: RawEmail[] = [];

    try {
      conn = await connectIMAP(
        settings.smtp_host.replace("smtp.", "imap."), // smtp.gmail.com → imap.gmail.com
        settings.smtp_username || settings.email_address,
        settings.smtp_password
      );
      rawEmails = await fetchReplies(conn, leadEmails);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      // Return user-friendly error without crashing
      return new Response(
        JSON.stringify({
          error: message,
          replies: [],
          checked_at: new Date().toISOString(),
        }),
        {
          status: 200, // 200 so frontend can display the error gracefully
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    } finally {
      if (conn) {
        try {
          await imapCommand(conn, "Z001", "LOGOUT");
          conn.close();
        } catch {
          // ignore logout errors
        }
      }
    }

    // Filter to only emails from known leads
    const matchedEmails = rawEmails.filter(
      (e) => emailToCampaign[e.from]
    );

    // Check existing replies to avoid duplicates (by lead_email + subject)
    const serviceClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: existingReplies } = await serviceClient
      .from("email_replies")
      .select("lead_email, subject")
      .eq("user_id", userId);

    const existingKeys = new Set(
      (existingReplies || []).map(
        (r: { lead_email: string; subject: string }) =>
          `${r.lead_email}::${r.subject}`
      )
    );

    // Classify and store new replies
    const schedulingLink = settings.scheduling_link || "";
    let newCount = 0;
    const newReplies: Array<{
      lead_email: string;
      lead_name: string;
      subject: string;
      classification: string;
      suggested_action: string;
    }> = [];

    for (const email of matchedEmails) {
      const key = `${email.from}::${email.subject}`;
      if (existingKeys.has(key)) continue;

      const { classification, draftReply, suggestedAction } =
        await classifyReply(email.subject, email.body, schedulingLink);

      const campaignInfo = emailToCampaign[email.from];

      await serviceClient.from("email_replies").insert({
        user_id: userId,
        campaign_id: campaignInfo.campaignId,
        lead_email: email.from,
        lead_name: campaignInfo.leadName,
        subject: email.subject,
        body: email.body,
        received_at: email.date,
        classification,
        ai_draft_reply: draftReply,
        ai_suggested_action: suggestedAction,
        status: "pending",
      });

      newReplies.push({
        lead_email: email.from,
        lead_name: campaignInfo.leadName,
        subject: email.subject,
        classification,
        suggested_action: suggestedAction,
      });

      newCount++;
      existingKeys.add(key);
    }

    return new Response(
      JSON.stringify({
        replies: newReplies,
        new_count: newCount,
        total_emails_scanned: rawEmails.length,
        total_leads_checked: leadEmails.length,
        checked_at: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("check-replies error:", err);
    return new Response(
      JSON.stringify({
        error: `Something went wrong while checking replies. Please try again. (${message})`,
        checked_at: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
