# End-to-end A2A test

Run a real hire against the live API, watch the job execute, and report results back. This is a state-changing test (creates a campaign + job + ledger rows in production data).

## Steps

1. **Issue a partner API key** for testing — insert an `a2a_api_keys` row with a freshly generated `eak_...` token; print the plaintext only in chat once (never stored).
2. **Hire** `saas-prospector` via `POST /v1/agents/saas-prospector/hire` with:
   - `callback_url`: a fresh `webhook.site` URL I'll generate
   - `campaign.niche`: "B2B SaaS founders"
   - `campaign.target_audience`: ["SaaS founders", "Heads of Growth"]
   - `campaign.volume`: 5
   - `spending_cap_cents`: 200
   - Bearer = the new API key
   - Expect 201 with `job_id` in <2s.
3. **Poll `GET /v1/jobs/{id}`** every ~15s until status `completed`, `failed`, or `paused`. Watch:
   - `last_event` walks through `leads.searching → leads.found → emails.generating → emails.ready → smtp.required` (since the auto-created partner user has no SMTP).
   - Confirms `smtp.required` callback fires (visible on webhook.site).
4. **Verify callbacks** by fetching the webhook.site inbox URL.
5. **Verify DB state**: `a2a_jobs` row has `leads_total > 0`, campaign has leads + emails, `a2a_ledger` rows for any sends (none expected without SMTP — that proves the safety guard works).
6. **Cleanup**: revoke the test API key (`status='revoked'`), leave the campaign as evidence so user can see it in the dashboard.

## Expected end state

- Job ends `paused` with `last_event = smtp.required` because partner has no SMTP.
- Webhook received: `job.queued`, `leads.found`, `emails.ready`, `smtp.required`.
- Dashboard shows the new "Hired via A2A" campaign with the A2AJobMeter card in `paused` state.

If you want me to also test real sending, connect Gmail on your account first and I'll point the hire at your `user_id` instead so it sends through your SMTP. Otherwise, approve and I'll run the test.