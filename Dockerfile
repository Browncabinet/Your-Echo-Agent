# Echo Agent MCP is a REMOTE server — no local build required.
# Endpoint: https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http
# Transport: streamable-http
# See glama.json for the remote configuration.
FROM alpine:3.20
LABEL org.opencontainers.image.title="yourechoagent-mcp"
LABEL org.opencontainers.image.description="Remote MCP server — hosted endpoint, no local install required."
LABEL org.opencontainers.image.source="https://github.com/Browncabinet/Your-Echo-Agent"
LABEL com.glama.mcp.runtime="remote"
LABEL com.glama.mcp.endpoint="https://dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http"
CMD ["echo", "Echo Agent MCP is a remote server. Configure your client with the URL in glama.json."]
