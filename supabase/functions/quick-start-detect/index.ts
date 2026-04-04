const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, scrapedContent } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: "URL is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const prompt = `You are a marketing AI assistant. Based on this website URL and content, detect the business details.

URL: ${url}
${scrapedContent ? `\nWebsite content:\n${scrapedContent.substring(0, 3000)}` : ""}

Return a JSON object with exactly these fields:
- "name": A suggested campaign name (short, like "Q1 [Business Type] Outreach")
- "niche": The closest match from this list: Real Estate, Grocery Retail, Legal Services, Health & Nutrition, Construction, Finance & Insurance, E-commerce, Software/SaaS, Education, Hospitality, Other
- "goal": A suggested campaign goal (1 sentence, specific and actionable)
- "targetAudience": An array of 3-5 ideal customer profile segments (strings)
- "businessSummary": A 1-sentence description of what this business does

Be specific and practical. Return ONLY valid JSON, no markdown fences.`;

    const aiRes = await fetch("https://api.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${Deno.env.get("LOVABLE_API_KEY")}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error("AI API error:", errText);
      return new Response(
        JSON.stringify({ error: "AI detection failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const aiData = await aiRes.json();
    const raw = aiData.choices?.[0]?.message?.content || "";

    let parsed;
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", raw);
      return new Response(
        JSON.stringify({ error: "Could not parse AI response" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
