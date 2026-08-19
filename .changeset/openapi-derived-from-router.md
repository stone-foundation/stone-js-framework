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

A named schema class is instantiated at documentation time to read its `rules()`. One whose rules genuinely need an injected service is **skipped rather than guessed at**, because a wrong contract is worse than a missing one.

**No router means no contract.** `stone.openapi` now fails with a `TypeError` naming the fix rather than publishing an empty document, because an empty contract is a lie about the application. Set `stone.openapi.deriveFromRouter` to `false` (or `stone.openapi.document`) to publish a hand-written one instead.

The generator stays free of any dependency on `@stone-js/router`: it duck-types the two methods it needs, exactly as the router carries module props without depending on the modules.
