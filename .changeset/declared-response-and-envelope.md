---
"@stone-js/http-core": patch
"@stone-js/openapi": patch
"@stone-js/resources": patch
---

feat: a route declares what it answers with, and an application names its own envelope

Two declarations that remove two kinds of boilerplate.

**`response` on a route.** A route already says what it is: its path, its verb, what it accepts, whether it is protected. Now it can say what it answers with, so the handler stays about the domain:

```ts
@Post('/tasks', { response: { type: 'json', status: 201 } })
create (event: IncomingHttpEvent): Task { return this.tasks.add(event.get('body')) }

@Delete('/tasks/:id', { response: { type: 'no-content' } })
remove (event: IncomingHttpEvent): void { this.tasks.remove(event.get('id')) }
```

`json`, `jsonp`, `html`, `text`, `file`, `redirect` and `no-content`, with a status and headers, all optional and defaulting to JSON with `200`. A method decorator still wins: `@JsonHttpResponse(201)` produces the response itself, and when a handler has already answered, the route option steps aside. The published contract reads the same declaration, so a route answering `201` is documented as answering `201` without saying it twice.

**`stone.resources.envelope`.** An endpoint answering a page returns something like `{ items, meta }`, and `items` and `meta` are not fields of a model: shaping that object published the wrapper as if it were the thing, which applications worked around with a middleware of their own. Naming the word once is enough, and everything around the payload is left as it was:

```ts
blueprint.set('stone.resources.envelope', { payload: 'items' })
```

Undeclared by default, deliberately: guessing which key holds the payload would quietly mangle a model that happens to have a field by that name.
