---
"@stone-js/openapi": patch
---

feat(openapi): the contract derives itself from the router

`OpenApiGenerator.addRouter(router)` reads the routing table and produces the document from it. A route already says what it is, so nothing has to be restated and nothing can drift:

```ts
@Post('/users', { validation: CreateUserSchema, auth: true, openapi: { summary: 'Create a user' } })
```

becomes a documented `POST /users` with its request body schema, its `security` requirement and its summary, without a second description of the endpoint anywhere.

What each route contributes:

| Route declares | The document gets |
|---|---|
| `path`, `method` | the path item and its operation |
| `name` | `operationId` |
| `validation` | `request.body` / `request.query` / `request.params`, resolved through `stone.validation.schemas` when the route named a schema |
| `auth` or `authz` | a `security` requirement, `bearerAuth` by default, configurable with `stone.openapi.securityScheme` |
| `openapi` | anything declared explicitly, which wins, because an author who wrote it meant it |
| `openapi: false` | nothing: an opt-out for endpoints that must not be published |

A named schema class is **built through the container**, so a class whose `rules()` needs i18n or any other service contributes its real schema. That holds both at request time, where the container is already up, and in the new console command below, where the whole application is booted first. Only when nothing can build a class is it skipped, and then deliberately: a wrong contract is worse than a missing one, since inventing a shape makes a client be written against something that does not exist.

**No router means no contract.** `stone.openapi` now fails with a `TypeError` naming the fix rather than publishing an empty document, because an empty contract is a lie about the application. Set `stone.openapi.deriveFromRouter` to `false` (or `stone.openapi.document`) to publish a hand-written one instead.

The generator stays free of any dependency on `@stone-js/router`: it duck-types the two methods it needs, exactly as the router carries module props without depending on the modules.

## And from the console, where the application is fully booted

```bash
stone openapi                       # print the contract
stone openapi export -o api.json    # write it, to commit or to feed a type generator
```

The console adapter boots the whole application before a command runs, which makes this the most
complete way to produce the document: every schema class is built with the services it asked for, and
what you get is exactly what the running application serves. Registered the same way the router
registers its own `router list` command, and only on the console platform.

