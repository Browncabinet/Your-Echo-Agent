import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// 1x1 transparent GIF
const PIXEL = new Uint8Array([
  71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 255, 255, 255,
  0, 0, 0, 33, 249, 4, 0, 0, 0, 0, 0, 44, 0, 0, 0, 0,
  1, 0, 1, 0, 0, 2, 2, 68, 1, 0, 59,
]);

serve(async (req) => {
  const url = new URL(req.url);
  const sendId = url.searchParams.get("id");
  const type = url.searchParams.get("t"); // "o" for open, "c" for click
  const redirect = url.searchParams.get("url");

  if (!sendId || !type) {
    return new Response("Missing params", { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  if (type === "o") {
    // Record open — only set if not already set
    await supabase
      .from("campaign_sends")
      .update({ opened_at: new Date().toISOString() })
      .eq("id", sendId)
      .is("opened_at", null);

    return new Response(PIXEL, {
      headers: {
        "Content-Type": "image/gif",
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  }

  if (type === "c" && redirect) {
    // Record click — only set if not already set
    await supabase
      .from("campaign_sends")
      .update({ clicked_at: new Date().toISOString() })
      .eq("id", sendId)
      .is("clicked_at", null);

    // Also mark as opened if not yet
    await supabase
      .from("campaign_sends")
      .update({ opened_at: new Date().toISOString() })
      .eq("id", sendId)
      .is("opened_at", null);

    return Response.redirect(redirect, 302);
  }

  return new Response("Invalid request", { status: 400 });
});
