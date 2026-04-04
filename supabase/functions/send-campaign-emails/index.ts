import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

// Simple SMTP email sender using Deno's built-in TLS
async function sendEmailViaSMTP(
  host: string,
  port: number,
  username: string,
  password: string,
  from: string,
  to: string,
  subject: string,
  body: string
): Promise<void> {
  // Use Deno's SMTP via denopkg
  const { SmtpClient } = await import(
    "https://deno.land/x/smtp@v0.7.0/mod.ts"
  );

  const client = new SmtpClient();

  if (port === 465) {
    await client.connectTLS({
      hostname: host,
      port,
      username,
      password,
    });
  } else {
    await client.connect({
      hostname: host,
      port,
      username,
      password,
    });
  }

  await client.send({
    from,
    to,
    subject,
    content: body.replace(/\n/g, "<br>"),
    html: body.replace(/\n/g, "<br>"),
  });

  await client.close();
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
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
    const userId = claimsData.claims.sub;

    const { campaign_id, leads, emails } = await req.json();

    if (!campaign_id || !leads?.length || !emails?.length) {
      return new Response(
        JSON.stringify({ error: "Missing campaign_id, leads, or emails" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Get user's email settings
    const { data: settings, error: settingsError } = await supabase
      .from("user_email_settings")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (settingsError || !settings?.is_connected) {
      return new Response(
        JSON.stringify({
          error: "Email not connected. Please connect your Gmail first.",
        }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const results: { email: string; status: string; error?: string }[] = [];
    const emailTemplate = emails[0]; // Send first email template

    // Rate limit: max 15 per batch
    const batch = leads.slice(0, 15);

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;

    for (const lead of batch) {
      const subject = (emailTemplate.subject || "")
        .replace(/\{\{name\}\}/g, lead.name)
        .replace(/\{\{company\}\}/g, lead.company);

      let body = (emailTemplate.body || "")
        .replace(/\{\{name\}\}/g, lead.name)
        .replace(/\{\{company\}\}/g, lead.company);

      // Pre-create the send record to get an ID for tracking
      const serviceClient = createClient(
        Deno.env.get("SUPABASE_URL")!,
        Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
      );

      const { data: sendRecord } = await serviceClient.from("campaign_sends").insert({
        campaign_id,
        user_id: userId,
        lead_email: lead.email,
        lead_name: lead.name,
        subject,
        status: "queued",
      }).select("id").single();

      const sendId = sendRecord?.id;

      // Inject tracking into email body
      if (sendId) {
        const trackBase = `${supabaseUrl}/functions/v1/track`;
        
        // Wrap links for click tracking
        body = body.replace(
          /href="(https?:\/\/[^"]+)"/g,
          (_, url) => `href="${trackBase}?id=${sendId}&t=c&url=${encodeURIComponent(url)}"`
        );

        // Add tracking pixel for open tracking
        const pixel = `<img src="${trackBase}?id=${sendId}&t=o" width="1" height="1" style="display:none" alt="" />`;
        body = body + pixel;
      }

      try {
        await sendEmailViaSMTP(
          settings.smtp_host,
          settings.smtp_port,
          settings.smtp_username,
          settings.smtp_password,
          settings.email_address,
          lead.email,
          subject,
          body
        );

        // Update status to sent
        if (sendId) {
          await serviceClient.from("campaign_sends")
            .update({ status: "sent", sent_at: new Date().toISOString() })
            .eq("id", sendId);
        }

        results.push({ email: lead.email, status: "sent" });

        // Small delay between sends (1 second)
        await new Promise((r) => setTimeout(r, 1000));
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : String(err);

        // Update the pre-created record to failed
        if (sendId) {
          await serviceClient.from("campaign_sends")
            .update({ status: "failed", error_message: errorMsg })
            .eq("id", sendId);
        }

        results.push({ email: lead.email, status: "failed", error: errorMsg });
      }
    }

    return new Response(
      JSON.stringify({
        sent: results.filter((r) => r.status === "sent").length,
        failed: results.filter((r) => r.status === "failed").length,
        results,
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
