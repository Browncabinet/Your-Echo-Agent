import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { websiteUrl, goal, niche, targetAudience, sellingPoints, leads } = await req.json();

    if (!goal || !leads || leads.length === 0) {
      return new Response(
        JSON.stringify({ error: "Goal and at least one lead are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Step 1: Scrape website if URL provided
    let businessContext = "";
    if (websiteUrl) {
      const FIRECRAWL_KEY = Deno.env.get("FIRECRAWL_API_KEY");
      if (FIRECRAWL_KEY) {
        try {
          let formattedUrl = websiteUrl.trim();
          if (!formattedUrl.startsWith("http")) formattedUrl = `https://${formattedUrl}`;

          console.log("Scraping website for context:", formattedUrl);
          const scrapeController = new AbortController();
          const scrapeTimeout = setTimeout(() => scrapeController.abort(), 10000);
          const scrapeRes = await fetch("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${FIRECRAWL_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              url: formattedUrl,
              formats: ["summary"],
              onlyMainContent: true,
            }),
            signal: scrapeController.signal,
          });
          clearTimeout(scrapeTimeout);

          if (scrapeRes.ok) {
            const scrapeData = await scrapeRes.json();
            const summary = scrapeData?.data?.summary || scrapeData?.summary || "";
            if (summary) {
              businessContext = `\n\nSENDER'S BUSINESS (from their website ${formattedUrl}):\n${summary}`;
              console.log("Got business summary:", summary.substring(0, 100));
            }
          }
        } catch (e) {
          console.error("Scrape failed (continuing without):", e);
        }
      }
    }

    // Step 2: Generate personalized emails via AI
    const leadsList = leads
      .slice(0, 20)
      .map((l: any) => `- ${l.name} at ${l.company} (${l.email})`)
      .join("\n");

    const systemPrompt = `You are an expert cold email copywriter. You write concise, warm, personalized emails that get replies. Never be pushy or salesy. Sound like a real human, not AI.

Rules:
- Keep subject lines under 50 chars, curiosity-driven
- Keep body under 100 words
- Include one clear CTA (usually a short call)
- Reference the lead's company name naturally
- Reference what the sender actually does (from their website context)
- No generic filler. Every sentence should add value.
- Use a friendly, professional tone`;

    const sellingPointsBlock = sellingPoints && sellingPoints.length > 0
      ? `\n\nKEY SELLING POINTS TO INCLUDE (pick 2-3 as brief bullets or a short value proposition):\n${sellingPoints.map((p: string) => `• ${p}`).join("\n")}`
      : "";

    const userPrompt = `Generate personalized cold email templates for the following campaign:

CAMPAIGN GOAL: ${goal}
NICHE: ${niche || "General"}
TARGET AUDIENCE: ${(targetAudience || []).join(", ") || "Business professionals"}
${businessContext}${sellingPointsBlock}

LEADS TO PERSONALIZE FOR:
${leadsList}

Generate exactly 2 email templates:
1. An "initial" email (first outreach)
2. A "followup" email (sent 5 days later if no reply)

For the initial email, also provide a B variant subject line for A/B testing.

Return a JSON object with this exact structure:
{
  "templates": [
    {
      "type": "initial",
      "subject": "subject line A",
      "subjectB": "subject line B for A/B test",
      "body": "email body using {{name}} and {{company}} as placeholders"
    },
    {
      "type": "followup",
      "subject": "follow-up subject",
      "body": "follow-up body using {{name}} and {{company}} as placeholders",
      "delay": 5
    }
  ]
}`;

    console.log("Calling AI for email generation...");
    const aiController = new AbortController();
    const aiTimeout = setTimeout(() => aiController.abort(), 25000);
    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "generate_email_templates",
              description: "Generate personalized cold email templates",
              parameters: {
                type: "object",
                properties: {
                  templates: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        type: { type: "string", enum: ["initial", "followup"] },
                        subject: { type: "string" },
                        subjectB: { type: "string" },
                        body: { type: "string" },
                        delay: { type: "number" },
                      },
                      required: ["type", "subject", "body"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["templates"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "generate_email_templates" } },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited — please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (aiRes.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Add funds in Settings > Workspace > Usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await aiRes.text();
      console.error("AI error:", aiRes.status, errText);
      throw new Error("AI generation failed");
    }

    const aiData = await aiRes.json();
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];

    let templates;
    if (toolCall?.function?.arguments) {
      const parsed = JSON.parse(toolCall.function.arguments);
      templates = parsed.templates;
    } else {
      // Fallback: try parsing content as JSON
      const content = aiData.choices?.[0]?.message?.content || "";
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        templates = JSON.parse(jsonMatch[0]).templates;
      } else {
        throw new Error("Could not parse AI response");
      }
    }

    console.log("Generated", templates.length, "email templates");

    return new Response(
      JSON.stringify({ success: true, templates }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("generate-emails error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
