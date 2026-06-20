# Glama release build for the Echo Agent MCP server.
# Builds the stdio MCP server in ./mcp-server and runs it.
# Do not copy package-lock.json here: Lovable-generated locks can point at a
# private npm mirror that Glama's external builder cannot access.
FROM node:20-alpine AS build
WORKDIR /app/mcp-server
COPY mcp-server/package.json ./
RUN npm install --include=dev --registry=https://registry.npmjs.org/
COPY mcp-server/tsconfig.json mcp-server/tsup.config.ts ./
COPY mcp-server/src ./src
RUN npm run build && npm prune --omit=dev

FROM node:20-alpine AS runtime
ENV NODE_ENV=production \
    ECHO_API_KEY="" \
    ECHO_API_BASE=""
WORKDIR /app/mcp-server
COPY --from=build /app/mcp-server/package.json ./package.json
COPY --from=build /app/mcp-server/node_modules ./node_modules
COPY --from=build /app/mcp-server/dist ./dist
LABEL org.opencontainers.image.title="yourechoagent-mcp"
LABEL org.opencontainers.image.description="Echo Agent MCP server — hire autonomous outreach agents from any MCP client."
LABEL org.opencontainers.image.source="https://github.com/Browncabinet/Your-Echo-Agent"
LABEL com.glama.mcp.required-env="ECHO_API_KEY"
CMD ["node", "dist/index.js"]
