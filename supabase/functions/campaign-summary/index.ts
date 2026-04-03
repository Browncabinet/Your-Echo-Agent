import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { campaign } = await req.json();

    if (!campaign || !campaign.name) {
      return new Response(
        JSON.stringify({ error: "Campaign data is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const { name, niche, goal, leadCount, emailCount, stats } = campaign;
    const { sent = 0, opened = 0, clicked = 0, replied = 0 } = stats || {};

    const openRate = sent > 0 ? ((opened / sent) * 100).toFixed(1) : "0";
    const clickRate = sent > 0 ? ((clicked / sent) * 100).toFixed(1) : "0";
    const replyRate = sent > 0 ? ((replied / sent) * 100).toFixed(1) : "0";

    const userPrompt = `Campaign: "${name}"
Niche: ${niche || "Not set"}
Goal: ${goal || "Not set"}
Leads: ${leadCount || 0}
Emails drafted: ${emailCount || 0}
Emails sent: ${sent}
Opened: ${opened} (${openRate}%)
Clicked: ${clicked} (${clickRate}%)
Replied: ${replied} (${replyRate}%)

Give a 2-sentence summary. Sentence 1: a warm, encouraging performance snapshot (e.g. "Nice work — your open rate is strong…"). Sentence 2: one specific, actionable suggestion. Keep it short and supportive.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          {
            role: "system",
            content:
              "You are a friendly marketing coach. Give brief, encouraging, actionable campaign summaries. Use a warm, professional tone. Never use markdown formatting — plain text only. Keep each sentence concise.",
          },
          { role: "user", content: userPrompt },
        ],
      }),
    });

    if (response.status === 429) {
      return new Response(
        JSON.stringify({ error: "AI is busy right now — please try again in a moment." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (response.status === 402) {
      return new Response(
        JSON.stringify({ error: "AI credits exhausted — please add funds in Settings > Workspace > Usage." }),
        { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!response.ok) {
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "Could not generate summary right now." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const summary = data.choices?.[0]?.message?.content?.trim() || "No summary available.";

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("campaign-summary error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
