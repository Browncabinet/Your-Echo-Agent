import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function client(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export default defineTool({
  name: "get_balance",
  title: "Get email balance",
  description: "Return the signed-in user's prepaid email balance and any active subscription tier.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_input, ctx) => {
    if (!ctx.isAuthenticated()) {
      return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    }
    const sb = client(ctx);
    const [{ data: credits }, { data: caps }] = await Promise.all([
      sb.from("user_credits").select("balance").eq("user_id", ctx.getUserId()).maybeSingle(),
      sb.rpc("current_week_caps", { _user_id: ctx.getUserId() }),
    ]);
    const tier = Array.isArray(caps) && caps[0] ? caps[0].tier : "none";
    const balance = credits?.balance ?? 0;
    return {
      content: [{ type: "text", text: `Balance: ${balance} emails. Tier: ${tier}.` }],
      structuredContent: { balance, tier },
    };
  },
});
