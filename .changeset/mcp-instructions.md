---
"@stone-js/mcp-adapter": minor
---

feat(mcp-adapter): advertise MCP `instructions` + add `defineMcp` helper.

- The MCP server now sends an `instructions` string to the agent (the Continuum contract: the tools are the developer's domain, resolved by the same kernel as an HTTP request; `stone_*` tools, when present, describe the framework itself). A sensible default (`DEFAULT_MCP_INSTRUCTIONS`) applies out of the box; override via `stone.mcp.instructions`.
- New `defineMcp(options)` blueprint helper to configure the whole `stone.mcp` server (name/version/instructions/tools) in one place, alongside `defineMcpTools`.

Enables the local-dev flow: run the same app on the MCP adapter (stdio) so a coding agent gets your domain as tools plus, by composing `@stone-js/mcp`, the framework's knowledge.
