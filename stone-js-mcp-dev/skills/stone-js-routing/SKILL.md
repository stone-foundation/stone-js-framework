---
name: stone-js-routing
description: Use when adding or changing routes, controllers, or HTTP endpoints in a Stone.js app with @stone-js/router. Covers the routing decorators, controllers, route groups, middleware, and the universal (node/browser) router. Verify live routes with the `stone_routes` MCP tool.
---

# Routing in Stone.js

`@stone-js/router` is a universal router (node and browser). Enable it on the app with `@Routing()`,
then declare routes with decorators or imperative definitions. Routing is platform-agnostic: the
same routes answer over any HTTP adapter.

## Route handlers on the app

```ts
import { Routing, Get, Post } from '@stone-js/router'
import { StoneApp, IncomingEvent } from '@stone-js/core'

@Routing()
@StoneApp({ name: 'my-app' })
class Application {
  @Get('/users')
  list () { return this.service.all() }

  @Post('/users')
  create (event: IncomingEvent) { return this.service.create(event.get('body')) }
}
```

## Controllers and groups

Group related routes on a controller with `@Controller('/prefix')`, then `@Get`, `@Post`, `@Put`,
`@Patch`, `@Delete`, `@Options`, `@Any`, or `@Match`. `@Page` declares a view/component route.

```ts
import { Controller, Get } from '@stone-js/router'

@Controller('/api/users')
class UserController {
  @Get('/')            // GET /api/users
  index () { /* ... */ }

  @Get('/:id')         // GET /api/users/:id
  show (event: IncomingEvent) { return this.repo.find(event.get('params').id) }
}
```

## Key points

- A handler returns a plain value; the response is built by the layers, not by you.
- Bind path params, apply per-route `middleware`, set `rules` (param regexps), `defaults`, and
  `bindings` on the route definition; all are introspectable.
- The router is also the app's kernel event handler when `@Routing()` is set.
- Prefer decorators, but the imperative form (route definitions under `stone.router.definitions`)
  is available and equivalent.

## Verify with the MCP tools

After adding routes, call `stone_routes` to confirm the resolved tree (path, methods, name,
handler, middleware). Use `stone_kernel` to see the middleware pipeline that every route traverses.
When unsure of an option, `stone_search` the knowledge base or `stone_docs` for the routing guide.

## Do not

- Do not read the request/response as platform objects in a handler; use the `IncomingEvent` API.
- Do not hand-roll URL parsing or a second router; the framework's matchers handle host, method,
  protocol, and URI.
