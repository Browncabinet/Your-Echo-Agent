# Verify updated Grok key

The user just updated `GROK_ECHO_KEY`. The code in `mcp-http` already aliases `ECHO_API_KEY` to `GROK_ECHO_KEY`, so no source changes are needed.

Steps:
1. Redeploy `mcp-http` and `mcp-grok` edge functions so the runtime loads the new secret value.
2. Test `tools/list` through `mcp-grok` to confirm the proxy still responds.
3. Test `hire_echo_agent` through `mcp-grok` to confirm the key is accepted and a job/dashboard URL is returned.
4. Report the result, including the exact curl/JSON snippet the user can reuse in Grok.
