const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { results, niche, targetAudience, batchSize } = await req.json();

    if (!results || !Array.isArray(results) || results.length === 0) {
      return new Response(
        JSON.stringify({ success: false, error: 'No search results provided' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const apiKey = Deno.env.get('LOVABLE_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'AI API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Combine all search result content, truncating each to keep within context limits
    const combinedContent = results.map((r: any, i: number) => {
      const parts = [
        r.title ? `Title: ${r.title}` : '',
        r.url ? `URL: ${r.url}` : '',
        r.description ? `Description: ${r.description}` : '',
        r.markdown ? `Content:\n${r.markdown.slice(0, 3000)}` : '',
      ].filter(Boolean);
      return `--- Result ${i + 1} ---\n${parts.join('\n')}`;
    }).join('\n\n');

    // Truncate total to ~30k chars to stay within model limits
    const truncated = combinedContent.slice(0, 30000);

    const maxLeads = batchSize || 50;
    const audienceStr = Array.isArray(targetAudience) ? targetAudience.join(', ') : (targetAudience || '');

    const systemPrompt = `You are an expert lead extraction assistant. Extract real business contacts from web page content. You MUST return valid JSON only, no markdown.`;

    const userPrompt = `Extract up to ${maxLeads} business contacts from these web pages. The target audience is: ${audienceStr || 'professionals'}. The industry/niche is: ${niche || 'general'}.

Look for:
- Full names of real people (not company names as person names)
- Company or organization names
- Email addresses — including obfuscated formats like "john [at] company [dot] com", "john(at)company.com", "john AT company DOT com"
- LinkedIn profile URLs (linkedin.com/in/...)

Rules:
- Only include contacts with a valid or reconstructable email address
- Skip generic addresses: info@, support@, admin@, hello@, contact@, noreply@, no-reply@, help@, sales@, team@, press@, media@, hr@, jobs@, careers@, billing@, webmaster@
- If no name is found near an email, leave name empty
- Infer company name from email domain if not explicitly stated (e.g., john@acmecorp.com → company: "Acmecorp")
- Do NOT invent or fabricate emails — only extract what's actually in the text

Return a JSON object with this exact structure:
{"leads": [{"name": "John Smith", "company": "Acme Corp", "email": "john@acme.com", "linkedin": "https://linkedin.com/in/johnsmith"}]}

If no contacts are found, return: {"leads": []}

Web page content to analyze:

${truncated}`;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const aiRes = await fetch('https://ai.gateway.lovable.dev/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!aiRes.ok) {
      const errText = await aiRes.text();
      console.error('AI API error:', errText);
      return new Response(
        JSON.stringify({ success: false, error: `AI extraction failed (${aiRes.status})` }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await aiRes.json();
    const content = aiData.choices?.[0]?.message?.content || '';
    
    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[1].trim());
      } else {
        console.error('Failed to parse AI response:', content.slice(0, 500));
        return new Response(
          JSON.stringify({ success: false, error: 'Failed to parse AI response', leads: [] }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const leads = (parsed.leads || []).filter((l: any) => l.email && l.email.includes('@'));

    console.log(`AI extracted ${leads.length} leads from ${results.length} search results`);

    return new Response(
      JSON.stringify({ success: true, leads }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Extract leads error:', error);
    const msg = error instanceof Error ? error.message : 'Failed to extract leads';
    return new Response(
      JSON.stringify({ success: false, error: msg, leads: [] }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
