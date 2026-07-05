import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { emitCallback } from "../_shared/a2a.ts";

// 1x1 transparent GIF
const PIXEL = new Uint8Array([
  71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 255, 255, 255,
  0, 0, 0, 33, 249, 4, 0, 0, 0, 0, 0, 44, 0, 0, 0, 0,
  1, 0, 1, 0, 0, 2, 2, 68, 1, 0, 59,
]);

async function maybeEmitA2A(
  supabase: ReturnType<typeof createClient>,
  sendId: string,
  event: "email.opened" | "email.clicked",
) {
  try {
    const { data: send } = await supabase
      .from("campaign_sends")
      .select("campaign_id, lead_email, subject")
      .eq("id", sendId)
      .maybeSingle();
    if (!send?.campaign_id) return;
    const { data: job } = await supabase
      .from("a2a_jobs")
      .select("id, callback_url")
      .eq("campaign_id", send.campaign_id)
      .maybeSingle();
    if (job?.callback_url) {
      emitCallback(job.callback_url, event, {
        job_id: job.id,
        send_id: sendId,
        lead_email: send.lead_email,
        subject: send.subject,
      });
    }
  } catch (e) {
    console.error("a2a track callback failed", e);
  }
}

serve(async (req) => {
  const url = new URL(req.url);
  const sendId = url.searchParams.get("id");
  const type = url.searchParams.get("t");
  const redirect = url.searchParams.get("url");

  if (!sendId || !type) return new Response("Missing params", { status: 400 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  if (type === "o") {
    const { data: updated } = await supabase
      .from("campaign_sends")
      .update({ opened_at: new Date().toISOString() })
      .eq("id", sendId)
      .is("opened_at", null)
      .select("id");
    if (updated && updated.length > 0) {
      await maybeEmitA2A(supabase, sendId, "email.opened");
    }
    return new Response(PIXEL, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  if (type === "c" && redirect) {
    // Validate redirect: only http(s), block javascript:/data:/etc. to prevent open-redirect XSS.
    let safeRedirect: string | null = null;
    try {
      const u = new URL(redirect);
      if (u.protocol === "http:" || u.protocol === "https:") {
        safeRedirect = u.toString();
      }
    } catch {
      // fall through
    }
    if (!safeRedirect) return new Response("Invalid redirect", { status: 400 });

    const { data: updated } = await supabase
      .from("campaign_sends")
      .update({ clicked_at: new Date().toISOString() })
      .eq("id", sendId)
      .is("clicked_at", null)
      .select("id");
    await supabase
      .from("campaign_sends")
      .update({ opened_at: new Date().toISOString() })
      .eq("id", sendId)
      .is("opened_at", null);
    if (updated && updated.length > 0) {
      await maybeEmitA2A(supabase, sendId, "email.clicked");
    }
    return Response.redirect(safeRedirect, 302);
  }

  return new Response("Invalid request", { status: 400 });
});
