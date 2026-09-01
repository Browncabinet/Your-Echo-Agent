# Activate GROK_ECHO_KEY on the Grok MCP endpoint

## Status
- `GROK_ECHO_KEY` (your `eak_` key) is now saved in backend secrets.
- The `mcp-grok` function is already deployed, but it was deployed **before** the secret existed — it currently returns an error because it can't see the new secret yet.

## Plan
1. **Redeploy `mcp-grok`** (no code changes) so the function picks up `GROK_ECHO_KEY` from the secret store.
2. **Verify** with a `tools/list` call to `https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-grok`:
   - Confirms the endpoint injects the stored `eak_` key and returns the tool list (`list_available_agents`, `get_agent_card`, `hire_echo_agent`, `get_job_status`, `control_job`, `rate_job`, plus discovery/PR tools).
3. Report the verified tool list back.

No design, page, or pricing changes. No new code — just a redeploy so the secret is visible to the function.
