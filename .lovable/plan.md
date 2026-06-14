Hardcode the user's Stripe live publishable key directly into `src/lib/stripe.ts` so it is used at build time without needing Build Secrets.

**Change:**
- In `src/lib/stripe.ts`, set the active publishable key to the user's provided `pk_live_51ThA7rDC0NTHQ87sRfjpfakI3ILuGmSsAekff0g5tqmGA5EGX648PrbLCCrhPh3Qa3d3SpbQngfOJAXw0Tk7F3oQ0014BSVu7Y`, replacing the dynamic env-var lookup.
- Keep the fallback to `VITE_PAYMENTS_CLIENT_TOKEN` if the hardcoded key is ever removed, but default to the live key.

**Why:** The user could not locate Build Secrets in their workspace settings, so hardcoding the publishable key is the simplest path. Publishable keys are safe to commit — they are designed to be public.

**Post-ship:** Republish the app so the production build picks up the live key.