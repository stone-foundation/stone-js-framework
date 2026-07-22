---
"@stone-js/mcp-dev": minor
---

Add `@stone-js/mcp-dev`: serve Stone.js's knowledge to your coding agent. A single `stone mcp` command starts an MCP server over stdio (Ctrl+C to stop, like `stone dev`) that hands the MCP SDK the built-in framework-knowledge tools (`stone_search`, `stone_concept`, `stone_docs`, `stone_modules`, `stone_best_practices`, `stone_gaps`, `stone_brief`) merged with your own, and logs every tool call to **stderr** so you watch the agent think while stdout stays reserved for the protocol. These are dev/knowledge helpers, so the SDK owns the protocol and executes the handlers in-process (they do not traverse the kernel).

The command is registered the same way the router registers its own: a blueprint middleware contributes it to `stone.adapter.commands`, so the CLI (itself a Stone.js app on the Node CLI adapter) discovers it by introspection. Activate with the `@McpDev()` decorator or by registering `mcpDevBlueprint` / `defineMcpDev()`; add your tools and set the server name/instructions under `stone.mcpDev`.

This supersedes and replaces the removed `@stone-js/mcp` and `@stone-js/mcp-adapter`: the framework knowledge now lives here, and exposing an app's own domain to agents over MCP (the web/Streamable-HTTP capability) is a separate, upcoming concern rather than a bespoke adapter.
