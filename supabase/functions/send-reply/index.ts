import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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
  const { SmtpClient } = await import(
    "https://deno.land/x/smtp@v0.7.0/mod.ts"
  );
  const client = new SmtpClient();

  if (port === 465) {
    await client.connectTLS({ hostname: host, port, username, password });
  } else {
    await client.connect({ hostname: host, port, username, password });
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
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = user.id;

    const { reply_id, reply_body } = await req.json();

    if (!reply_id || !reply_body?.trim()) {
      return new Response(
        JSON.stringify({ error: "Missing reply_id or reply_body" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch the reply record (RLS ensures ownership)
    const { data: reply, error: replyError } = await supabase
      .from("email_replies")
      .select("*")
      .eq("id", reply_id)
      .single();

    if (replyError || !reply) {
      return new Response(
        JSON.stringify({ error: "Reply not found or access denied" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (reply.status === "sent") {
      return new Response(
        JSON.stringify({ error: "Reply already sent" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Fetch user's email settings using service role (smtp_password is column-restricted for authenticated)
    const serviceClientForSettings = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: settings, error: settingsError } = await serviceClientForSettings
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

    // Build reply subject (add Re: if not already present)
    const replySubject = reply.subject.startsWith("Re:")
      ? reply.subject
      : `Re: ${reply.subject}`;

    // Send the reply via SMTP
    await sendEmailViaSMTP(
      settings.smtp_host,
      settings.smtp_port,
      settings.smtp_username,
      settings.smtp_password,
      settings.email_address,
      reply.lead_email,
      replySubject,
      reply_body
    );

    // Update the reply record to "sent"

    await serviceClientForSettings
      .from("email_replies")
      .update({
        status: "sent",
        ai_draft_reply: reply_body,
        sent_at: new Date().toISOString(),
      })
      .eq("id", reply_id)
      .eq("user_id", userId);

    return new Response(
      JSON.stringify({ success: true, message: "Reply sent successfully" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";

    // Provide user-friendly SMTP error messages
    let userMessage = message;
    if (
      message.includes("BadResource") ||
      message.includes("connection")
    ) {
      userMessage =
        "Could not connect to Gmail — please verify your App Password and try again.";
    } else if (
      message.includes("auth") ||
      message.includes("535")
    ) {
      userMessage =
        "Gmail authentication failed — please check your App Password in Gmail settings.";
    }

    return new Response(JSON.stringify({ error: userMessage }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
