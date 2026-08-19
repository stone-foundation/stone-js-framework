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

**Arranged by the build, not by your application.** Introspection is a development concern, so this
package ships a CLI plugin: `npm i -D @stone-js/mcp-dev` and the CLI auto-discovers it, injecting the
publishing hook on development builds only. Your app never imports this module, and a production build
carries none of it. Opt out with `mcpDev: { publishContext: false }` in `stone.config.mjs`, which
generates nothing rather than shipping code that decides not to run.

A file rather than a dev endpoint, deliberately: the Blueprint is assembled once before the first event
and then read, so publishing it at boot *is* the value. No port to discover, no route added to an
application, no token to protect, and it works for a CLI or an edge context with no HTTP surface. What
genuinely moves at run time is a different question, for a different tool.

Two defects found on the way and fixed here. `@stone-js/cli` rewrote plugin-contributed relative
specifiers against `.stone/tmp`, where a production entry lives but a development entry does not, so
any plugin contributing a module was silently unresolvable under `stone dev` — `@stone-js/i18n`'s
catalogue injection included. And `@stone-js/openapi`'s CLI plugin shipped with no default export
(multi-entry re-exports named exports only), so first-party auto-discovery never loaded it at all.
