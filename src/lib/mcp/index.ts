import { auth, defineMcp } from "@lovable.dev/mcp-js";
import getBalance from "./tools/get-balance";
import listMyJobs from "./tools/list-my-jobs";
import listReferrals from "./tools/list-referrals";

// The OAuth issuer MUST be the direct Supabase host. Build it from the project
// ref (Vite inlines this literal at build time, so it stays import-safe).
const projectRef = import.meta.env.VITE_SUPABASE_PROJECT_ID ?? "project-ref-unset";

export default defineMcp({
  name: "your-echo-mcp",
  title: "Your Echo",
  version: "0.1.0",
  instructions:
    "Query the signed-in user's Your Echo account: prepaid email balance, recent outreach jobs, and referral codes. Each tool acts as the authenticated user via Supabase RLS.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [getBalance, listMyJobs, listReferrals],
});
