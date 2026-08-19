---
"@stone-js/validation": patch
"@stone-js/resources": patch
"@stone-js/router": patch
---

feat: a route declares what it accepts and what it exposes, and the modules do the rest

A route definition is the one place that describes a route, so `validation` and `resource` now live there, next to the path and the handler. Each module reads the part it owns; the router carries them and does nothing with them, which is what keeps it agnostic and what will let `@stone-js/openapi` publish the contract without being told a second time.

```ts
@Post('/users', { validation: { body: CreateUserSchema }, resource: userResource })
create (event: IncomingHttpEvent) {
  const { body } = validated<{ body: CreateUser }>(event) ?? {}
  return this.users.add(body)          // the domain model, whole
}
```

**Input.** `@stone-js/validation` contributes a route middleware that validates what the route declared before the handler runs, and publishes the **parsed** value in the event's metadata, read with `validated(event)`. That matters more than it looks: a schema does not only accept or reject, it coerces and strips. `validateEvent` used to compute the parsed value and throw it away, so an application validated `"42"` and then used the string. It now returns it.

**Output.** `@stone-js/resources` contributes a route middleware that applies the declared resource to whatever the handler returned. A service returns its domain model, including the fields it must never expose, and the route decides what leaves. It runs on the raw return value, before any response wrapping, so it knows nothing of HTTP and works in every context. Sparse fieldsets still apply, so `?fields=id,name` narrows the output without the route changing.

Both accept a name instead of a value, resolved from `stone.validation.schemas` and `stone.resources.registry`, and both **fail loudly on a name nobody registered** rather than silently validating nothing or returning the model unshaped.

`@stone-js/resources` gains its two activation paths, `@Resources()` and `resourcesBlueprint`, which it needed to contribute its middleware.

Both middlewares are a no-op on routes that declare nothing, so enabling either costs an application that does not use it one function call per request.
