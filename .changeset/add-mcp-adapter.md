---
"@stone-js/mcp-adapter": minor
---

Add `@stone-js/mcp-adapter`: expose your Stone.js domain to AI agents over the Model Context Protocol — the MCP equivalent of a REST API, with no changes to your handlers. MCP is treated as a Continuum context: a tool call becomes an `IncomingEvent` that flows through the full kernel (middleware, DI, hooks) via the `McpDispatcher`, and its result is returned as MCP content. `run()` starts an MCP server (stdio by default; any transport via config) advertising the tools declared in `stone.mcp.tools` (`defineMcpTools`). Ships `@Mcp()` + `mcpAdapterBlueprint`. Built on `@modelcontextprotocol/sdk`.
