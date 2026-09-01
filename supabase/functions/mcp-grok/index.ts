// Grok-friendly MCP endpoint.
//
// Grok custom connectors frequently strip query strings from tool calls, so this
// endpoint takes NO query params and NO user login. It reads the server-side
// secret GROK_ECHO_KEY (an eak_ Echo API key) and injects it as
// `Authorization: Bearer eak_...` on every forwarded request to mcp-http, which
// exposes the full tool set (list_available_agents, get_agent_card,
// hire_echo_agent, get_job_status, control_job, rate_job, ...).
//
// If the caller already sends `Authorization: Bearer eak_...` (or
// x-echo-api-key / x-api-key), that key wins and the server secret is ignored.

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, mcp-session-id, mcp-protocol-version, x-echo-api-key, x-api-key, accept",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Expose-Headers": "mcp-session-id",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const TARGET = `${SUPABASE_URL}/functions/v1/mcp-http`;

// Strip whitespace/control/non-ASCII chars (e.g. a trailing newline from a
// copy-pasted secret) — Headers values must be valid ByteStrings.
function sanitizeKey(raw: string | null | undefined): string {
  return (raw ?? "").replace(/[^\x21-\x7E]/g, "").trim();
}

function callerKey(req: Request): string | null {
  const direct = sanitizeKey(req.headers.get("x-echo-api-key") || req.headers.get("x-api-key"));
  if (direct.startsWith("eak_")) return direct;
  const m = (req.headers.get("authorization") || "").match(/^Bearer\s+(eak_[A-Za-z0-9_-]+)$/i);
  return m ? m[1] : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const serverKey = Deno.env.get("GROK_ECHO_KEY") ?? "";
  const key = callerKey(req) || serverKey;

  if (!key) {
    return new Response(
      JSON.stringify({
        jsonrpc: "2.0",
        id: null,
        error: {
          code: -32001,
          message:
            "This endpoint is not configured: the server secret GROK_ECHO_KEY is missing. Set it in your Your Echo backend secrets, or send Authorization: Bearer eak_... instead.",
        },
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }

  // Forward the MCP request verbatim, minus hop-by-hop / auth headers we replace.
  const headers = new Headers();
  for (const [k, v] of req.headers) {
    const lower = k.toLowerCase();
    if (["authorization", "host", "content-length", "x-echo-api-key", "x-api-key"].includes(lower)) continue;
    headers.set(k, v);
  }
  headers.set("Authorization", `Bearer ${key}`);
  if (!headers.get("accept")) headers.set("accept", "application/json, text/event-stream");

  const body = req.method === "GET" || req.method === "HEAD" ? undefined : await req.arrayBuffer();

  const upstream = await fetch(TARGET, {
    method: req.method,
    headers,
    body,
  });

  const merged = new Headers(upstream.headers);
  for (const [k, v] of Object.entries(corsHeaders)) merged.set(k, v);
  return new Response(upstream.body, { status: upstream.status, headers: merged });
});
