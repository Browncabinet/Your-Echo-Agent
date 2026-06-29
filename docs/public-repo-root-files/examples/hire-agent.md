# Example: Hire an autonomous outreach agent

Requires `ECHO_API_KEY`. Paste into your MCP client:

> Use the SaaS Prospector agent to find 25 Heads of Growth at Series A B2B fintech companies in North America. Pitch our analytics tool "Probe". Sender: Jamie Lee, jamie@probe.ai. Spending cap: $20. Then poll the job every 60 seconds until completion and summarize the result.

Expected behavior:
1. Calls `list_available_agents` filtered to find SaaS Prospector
2. Calls `hire_echo_agent` with the campaign brief + cap
3. Polls `get_job_status` until `status: completed`
4. Returns leads found, emails sent, and any replies

You can also pause/cancel mid-run with `control_job`.
