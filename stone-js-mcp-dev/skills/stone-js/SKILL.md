---
name: stone-js
description: Use when writing, structuring, or reviewing a Stone.js (@stone-js/*) application. Covers the Continuum model, StoneApp bootstrapping, the declarative/imperative paradigms, the three module forms, and blueprint configuration. Pair with the `stone_*` MCP tools from @stone-js/mcp-dev to introspect the live app.
---

# Building with Stone.js

Stone.js is the reference implementation of the Continuum Architecture: an application is an
**act**, `Application = Domain × Context → Resolution`. You write your domain once; the context
(runtime, protocol, caller) applies to it at run time. Stone.js *is* the context.

## Golden rules

- **The domain never imports the platform.** No HTTP/CLI/browser vocabulary leaks into domain code.
  A handler receives an `IncomingEvent` and returns a value; the adapter and kernel do the rest.
- **Two paradigms, at parity.**
  - *Declarative*: TC39 **stage-3** decorators (`@StoneApp`, `@Routing`, `@Get`, …) with
    `Symbol.metadata`. **Never** use `reflect-metadata` or `experimentalDecorators`.
  - *Imperative*: `define*` helpers producing meta-modules `{ module, isClass?, isFactory? }`.
- **Three forms everywhere**: class, factory, and function. The **function form never receives the
  container**; **providers forbid the function form**.
- **All configuration lives on the Blueprint under dotted `stone.*` keys.** It is built once, before
  any event, by introspecting decorators or by imperative meta-modules.
- Constructors are **private/protected**; expose a `static create()`.
- ESM only (`"type": "module"`), TypeScript strict, `ts-standard` lint, Vitest (aim for 100%),
  conventional commits.

## A minimal app

```ts
import { StoneApp, IncomingEvent } from '@stone-js/core'
import { Routing, Get } from '@stone-js/router'

@Routing()
@StoneApp({ name: 'my-app' })
class Application {
  @Get('/hello')
  hello (event: IncomingEvent) {
    return { message: `Hello ${event.get<string>('name', 'world')}` }
  }
}
```

The same class can be served over HTTP, in a Lambda, in the browser, or on the edge: you change the
**adapter**, not the domain. See the `stone-js-adapters` skill.

## Workflow

1. **Before writing code, query the framework.** Call the `stone_search`, `stone_concept`,
   `stone_modules`, and `stone_docs` MCP tools (served by `stone mcp`) to confirm the current
   conventions and the right module for the job, instead of guessing from generic Node knowledge.
2. **Inspect the app** with `stone_app`, `stone_routes`, `stone_commands`, `stone_adapters`,
   `stone_providers`, `stone_kernel`, and `stone_config` to see what it actually declares.
3. Reach for an official module rather than re-implementing: validation, auth, authz, resources,
   openapi, testing, realtime, event-bus, queue, cache. Declare internal deps as `workspace:*`.
4. **Every bug fix earns a behavioral test** (exercise real behavior, not mocks).

## Anti-patterns to reject

- Importing `reflect-metadata` or enabling `experimentalDecorators`.
- Putting HTTP/CLI specifics in the core/domain.
- Passing the container to a function-form module, or using a function-form provider.
- Storing durable content in a module's `docs/` folder (it is TypeDoc output, wiped each build).
