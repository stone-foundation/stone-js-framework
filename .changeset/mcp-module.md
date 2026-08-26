---
"@stone-js/mcp": patch
---

feat: your routes as tools an AI agent can call

`@stone-js/mcp` exposes an application's existing routes over the Model Context Protocol. **A tool is a route that said so:**

```ts
@Post('/notes', { mcp: 'create-note' })
create (event: IncomingHttpEvent) { }
```

Nothing is registered twice and nothing is described twice. `tools/list` is derived from the router, and a `tools/call` is dispatched **back into the router**, so the rate limit, the authentication, the authorization and the validation that guard the route are the ones that guard the tool. That is the whole permission model, and it is deliberately not a model: a module that called the handler directly would turn every annotated route into a way around its own guard, and nothing would report it. The caller's headers travel with the call, so the bearer an agent was given is the bearer the route authenticates. An agent acts for someone, and that someone is the principal.

**It is one POST route.** No socket, no event stream, no session: the client posts JSON-RPC, the server answers JSON, the connection closes. A stream is only needed for what a server sends unprompted, and an API exposing its own routes sends none of it. So this runs unchanged on a long-lived Node server, on a Lambda, or at the edge.

Everything a tool needs is derived from what the application already declared, and every source is optional. The name falls back to the route's name, the description to its `openapi` summary, the input schema to its validation schema converted through `@stone-js/openapi` (an optional peer), and failing that to the route's own path parameters. An application with the full stack writes almost nothing; one with none of it still gets working tools. A tool with no description is exposed **and logged**, because an agent reading a bare name will guess, and it guesses worst on the routes that write; `stone.mcp.requireDescription` leaves those out instead.

Declared on the route, or on the handler with `@Tool`, the same shape as `@Validate` and `@Returns`. Activated by `@Mcp()` or by `mcpBlueprint`, never a third helper. The endpoint is a route, so it is protected like one, through `stone.mcp.route`.
