# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.2.x   | ✅                 |
| < 0.2   | ❌                 |

## Reporting a Vulnerability

**Please do NOT open a public GitHub issue for security vulnerabilities.**

Instead, email **security@yourechoagent.com** with:

1. A description of the issue
2. Steps to reproduce
3. Potential impact
4. (Optional) Suggested fix

We aim to:

- Acknowledge your report within **48 hours**
- Provide a fix or mitigation within **7 days** for critical issues
- Credit you in the release notes (unless you prefer to stay anonymous)

## Security Practices

- **Webhook callbacks** are signed with HMAC-SHA256 using `A2A_CALLBACK_SIGNING_SECRET`
- **API keys** (`eak_*`) are hashed at rest; only the prefix is stored in plain text
- **Demo-tier tools** (`discover_events`) never touch your account or store data
- **No telemetry**: the stdio server does not phone home

## Scope

In scope:
- The `@browncabinet/yourechoagent-mcp` npm package
- The hosted endpoint at `dqovpwkmmtxqlrdvfuzz.supabase.co/functions/v1/mcp-http`

Out of scope:
- The main yourechoagent.com web application (report via security@yourechoagent.com)
- Third-party MCP clients (Claude Desktop, Cursor, etc.)
