---
'@stone-js/mcp-dev': patch
'@stone-js/cli': patch
'@stone-js/openapi': patch
---

`stone mcp` describes the application you are actually running.

It is a console command, so a blueprint it resolves for itself is the one a **console** boot produces:
its adapters, its response type and every platform-conditional contribution belong to a different
application than the one under `stone dev`. Everything platform-independent was right — routes,
providers, the kernel handler — and everything else described an app that does not exist, without
saying so.

The running application now publishes its resolved configuration to `.stone/app-context.json`, and the
MCP server reads it. A new `stone_describes` tool says which application the answers describe and how
the server knows, so a fallback is visible rather than silently wrong.

**Dev tooling only, with nothing to declare in your application.** `@McpDev()`, `mcpDevBlueprint` and
`defineMcpDev` are **removed**: introspection is a development concern, and a development tool in an
application's module graph makes a production build depend on a package the app does not need, for a
feature nobody uses in production.

`npm i -D @stone-js/mcp-dev` is now the whole setup. The CLI auto-discovers the plugin, which registers
`stone mcp` and — on a development build only — injects the publishing hook. Options move to
`stone.config.mjs` under `mcpDev` (server name, instructions, your own tools, `publishContext`), where
the rest of the build is already configured. The browser build goes too: it existed to keep an app-side
decorator inert in a SPA, and there is no longer anything app-side to neutralise.

A file rather than a dev endpoint, deliberately: the Blueprint is assembled once before the first event
and then read, so publishing it at boot *is* the value. No port to discover, no route added to an
application, no token to protect, and it works for a CLI or an edge context with no HTTP surface. What
genuinely moves at run time is a different question, for a different tool.

Two defects found on the way and fixed here. `@stone-js/cli` rewrote plugin-contributed relative
specifiers against `.stone/tmp`, where a production entry lives but a development entry does not, so
any plugin contributing a module was silently unresolvable under `stone dev` — `@stone-js/i18n`'s
catalogue injection included. And `@stone-js/openapi`'s CLI plugin shipped with no default export
(multi-entry re-exports named exports only), so first-party auto-discovery never loaded it at all.
