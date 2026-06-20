# Glama release build for the Echo Agent MCP server.
# Builds the stdio MCP server in ./mcp-server and runs it.
FROM node:20-alpine AS build
WORKDIR /app/mcp-server
COPY mcp-server/package.json mcp-server/package-lock.json ./
RUN npm ci
COPY mcp-server/tsconfig.json mcp-server/tsup.config.ts ./
COPY mcp-server/src ./src
RUN npm run build && npm prune --omit=dev

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app/mcp-server
COPY --from=build /app/mcp-server/package.json ./package.json
COPY --from=build /app/mcp-server/node_modules ./node_modules
COPY --from=build /app/mcp-server/dist ./dist
LABEL org.opencontainers.image.title="yourechoagent-mcp"
LABEL org.opencontainers.image.description="Echo Agent MCP server — hire autonomous outreach agents from any MCP client."
LABEL org.opencontainers.image.source="https://github.com/Browncabinet/Your-Echo-Agent"
CMD ["node", "dist/index.js"]
