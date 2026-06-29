# Glama release build for the Echo Agent MCP server.
# Layout-agnostic: works whether files live at the repo root OR nested in /mcp-server/.
FROM node:20-alpine
WORKDIR /app

# Copy everything from the repo
COPY . .

# If mcp-server/package.json exists, build there and lift dist/ to /app/dist.
# Otherwise build at the root. Final entry is always /app/dist/index.js.
RUN if [ -f mcp-server/package.json ]; then \
      cd mcp-server && \
      npm install --include=dev --registry=https://registry.npmjs.org/ && \
      npm run build && \
      cp -r dist /app/dist && \
      cp -r node_modules /app/node_modules && \
      cp package.json /app/package.json ; \
    else \
      npm install --include=dev --registry=https://registry.npmjs.org/ && \
      npm run build ; \
    fi

ENV NODE_ENV=production \
    ECHO_API_KEY="" \
    ECHO_API_BASE=""

LABEL org.opencontainers.image.title="yourechoagent-mcp"
LABEL org.opencontainers.image.description="Echo Agent MCP server — discover events and hire autonomous outreach agents from any MCP client."
LABEL org.opencontainers.image.source="https://github.com/Browncabinet/yourechoagent-mcp"
LABEL com.glama.mcp.required-env="ECHO_API_KEY"

CMD ["node", "/app/dist/index.js"]
