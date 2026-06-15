## Google Search Console Verification Plan

### Goal
Verify `https://yourechoagent.com/` with Google Search Console so the site can be listed in A2A directories and tracked for search performance.

### Steps

1. **Link Google Search Console connector to project**
   - Link "Natasha's Google Search Console" (workspace connection) to this project so the gateway API key becomes available in edge functions.

2. **Request META verification token**
   - Call the Google Site Verification API via the Lovable connector gateway to obtain a `google-site-verification` meta tag token for `https://yourechoagent.com/`.

3. **Inject meta tag into `index.html`**
   - Add `<meta name="google-site-verification" content="<TOKEN>" />` inside the `<head>` of `public/index.html` (or `index.html` root).

4. **Publish/deploy the site**
   - Ensure the meta tag is live at the root domain before Google fetches it.

5. **Call Google verify endpoint**
   - Invoke the verification API again to confirm Google sees the meta tag and marks the site as verified.

6. **Add site to Search Console property list**
   - Register the verified site so it appears in the user's Search Console dashboard and can be used for A2A directory submission.

### Verification Checklist
- [ ] Meta tag visible in page source at `https://yourechoagent.com/`
- [ ] Google Search Console API returns `200` on verify call
- [ ] Site appears in Search Console dashboard

### A2A Directory Impact
Once verified, the site will have Google Search Console ownership proof, which many A2A agent registries (e.g., Google A2A, AgentScope) require before accepting agent manifest submissions.