---
"@stone-js/mcp-adapter": minor
"@stone-js/mcp": minor
---

Align the MCP adapter with Stone.js principles + enrich the framework knowledge.

**@stone-js/mcp-adapter (breaking for existing `@Mcp` users):**
- Remove the adapter-owned `McpDispatcher`. An adapter's role is Integration only: turn a *cause* into an `IncomingEvent` and let the kernel route it. Tool calls now flow through the framework's standard light key-router: each declared tool is mapped to a key-route (`name` -> `handler`) under `stone.keyRouting.definitions`, and the kernel's `KeyRoutingEventHandler` dispatches it, through the same middleware / DI / hooks as any other event. **Apps using `@Mcp()` must now also use `@KeyRouting()`.** The adapter no longer imports the router (fully decoupled).
- Advertise MCP `instructions` (the Continuum contract) with a sensible default (`DEFAULT_MCP_INSTRUCTIONS`); add the `defineMcp` helper. It is explicitly a **tools adapter**: it exposes declared tools, not an auto-derived HTTP-route domain (a router-to-MCP bridge is a separate, future concern).

**@stone-js/mcp:**
- Add a `stone_docs` tool returning links to the authoritative documentation, so a coding agent can fetch full detail beyond the knowledge index.
