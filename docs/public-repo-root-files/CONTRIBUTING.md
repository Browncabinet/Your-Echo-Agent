# Contributing

Thanks for your interest in improving the Echo Agent MCP server! 🎉

## Quick start

```bash
git clone https://github.com/Browncabinet/yourechoagent-mcp.git
cd yourechoagent-mcp
npm install
npm run build
ECHO_API_KEY=eak_... npm run inspect
```

## How to contribute

1. **Open an issue first** for anything bigger than a typo so we can align on the approach.
2. **Fork → branch → PR.** Keep PRs focused — one logical change per PR.
3. **Add a changelog entry** in `CHANGELOG.md` under `[Unreleased]`.
4. **Run the build locally** (`npm run build`) before pushing.

## Adding a new tool

1. Add the schema + handler in `src/index.ts`
2. Document it in `README.md` (Tools table + example prompt)
3. Bump the version in `package.json`
4. Note it in `CHANGELOG.md`

## Code style

- TypeScript strict mode
- 2-space indent
- Prefer named exports
- No `any` unless absolutely necessary

## Release process

Maintainers tag releases with `vX.Y.Z`. The `publish.yml` workflow auto-publishes to npm.

## Code of Conduct

Be kind. See [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Questions?

Open a [Discussion](https://github.com/Browncabinet/yourechoagent-mcp/discussions) or email hello@yourechoagent.com.
