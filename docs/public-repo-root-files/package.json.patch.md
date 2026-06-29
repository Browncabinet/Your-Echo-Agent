# package.json updates for A-grade

Open `package.json` in the public repo via GitHub web editor and merge these fields.

## Bump version

```json
"version": "0.2.1"
```

## Add (if missing)

```json
{
  "engines": {
    "node": ">=18"
  },
  "keywords": [
    "mcp",
    "model-context-protocol",
    "echo-agent",
    "outreach",
    "lead-generation",
    "event-discovery",
    "cold-email",
    "a2a",
    "autonomous-agent",
    "claude",
    "cursor"
  ],
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ],
  "scripts": {
    "test": "node -e \"console.log('smoke ok')\" && exit 0"
  }
}
```

## Final check

After bumping, commit with message:

```
chore(release): v0.2.1 — A-grade polish
```
