---
name: stone-js-adapters
description: Use when choosing where a Stone.js app runs or adding a deploy target (Node HTTP, AWS Lambda, browser SPA, edge/WinterCG, CLI). Explains the "build once, deploy anywhere" model, how an adapter turns a platform cause into an IncomingEvent, and how the runtime collapse selects an adapter. Inspect targets with the `stone_adapters` MCP tool.
---

# Adapters: build once, deploy anywhere

An adapter is the **Integration** dimension of the Continuum: it captures a raw platform *cause*,
normalizes it into an *intention* (`IncomingEvent`), lets the kernel apply the domain, then turns
the response back into a native *effect*. The domain and routes never change; you add or switch an
adapter.

## The adapters

| Target | Package |
|---|---|
| Node HTTP server | `@stone-js/node-http-adapter` |
| AWS Lambda (generic / HTTP) | `@stone-js/aws-lambda-adapter`, `@stone-js/aws-lambda-http-adapter` |
| Web standard / edge (Cloudflare, Deno, Bun, Vercel, Netlify) | `@stone-js/fetch-adapter`, `@stone-js/edge-adapter` |
| Browser SPA | `@stone-js/browser-adapter` |
| CLI | `@stone-js/node-cli-adapter` |

Enable one by adding its decorator/blueprint to the app (e.g. `@NodeHttp()`), alongside `@StoneApp`
and `@Routing`.

```ts
import { NodeHttp } from '@stone-js/node-http-adapter'
import { Routing } from '@stone-js/router'
import { StoneApp } from '@stone-js/core'

@NodeHttp()
@Routing()
@StoneApp({ name: 'my-app' })
class Application {}
```

## How selection works (the runtime collapse)

When several adapters are registered, the kernel selects one per invocation, in order: a single
adapter wins outright; else the one marked `current: true`; else a match on `stone.adapter.platform`;
else a match on `alias`; else the one marked `default: true`. So one build can target many
platforms, and the environment decides which context applies.

## Rules

- Never leak a platform's request/response object into the domain; the adapter is the only place
  that speaks the platform's dialect.
- An adapter's job is Integration **only**: cause to `IncomingEvent`, and response to effect. It
  must not own routing or a dispatcher; the kernel routes.
- CLI commands are contributed by modules to `stone.adapter.commands` and discovered by the CLI
  through introspection (that is how `stone mcp` itself is added by `@stone-js/mcp-dev`).

## Verify with the MCP tools

Call `stone_adapters` to list registered adapters (platform, alias, default/current) and the active
platform. Use `stone_app` for a quick summary, and `stone_docs` for the adapter guides. `stone_search`
the knowledge base when picking a target or debugging selection.
