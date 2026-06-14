## Goal
Make the A2A buyer path feel instant and self-serve: sign up, get an `eak_` key, see jobs/history, top up billing, and avoid mixed “human weekly plan” messaging in the A2A flow.

## Plan

1. **Make self-serve signup the obvious path**
   - Update `/for-agents` hero and bottom CTA from “request an API key” to “create account + get instant API key”.
   - Emphasize Google sign-in as the fastest route.
   - Keep the existing `/for-agents/signup` flow, because it already calls `a2a-onboard` and mints an API key instantly.
   - Remove/avoid any copy that implies emailing `hello@yourechoagent.com` or waiting for manual access.

2. **Tighten the A2A buyer dashboard**
   - Keep `/for-agents/dashboard` protected, but make it read like a buyer control center: API key status, balance, total spent, recent jobs, callback log, quick test hire, docs links.
   - Add clearer empty states that point new buyers to: copy key, top up balance, run test hire.
   - Keep key rotation and webhook-secret rotation intact.

3. **Make billing self-serve and buyer-first**
   - Update `/for-agents/billing` so new buyers without a partner record are sent to `/for-agents/signup`, not told to hire once first.
   - Keep A2A credit packs (`$25`, `$100`, `$500`) and embedded checkout.
   - Remove “Email-volume top-ups / same packs human users buy” from the A2A billing page to avoid mixing human email packs with A2A per-result billing.

4. **Remove mixed human-vs-agent pricing from A2A pages**
   - Update A2A page CTAs so “View Pricing” points buyers to A2A billing/top-up context after signup, not the weekly human pricing page.
   - Update A2A copy to consistently say: prepaid balance, per-result pricing, no subscription required.
   - Leave the regular `/pricing` page and homepage pricing for human users untouched unless you explicitly want a broader pricing redesign.

5. **Verify the flow**
   - Check the relevant pages render cleanly: `/for-agents`, `/for-agents/signup`, `/for-agents/dashboard`, `/for-agents/billing`, `/for-agents/docs`.
   - Confirm no remaining A2A-facing copy says manual signup, weekly plans, or human-user top-ups.