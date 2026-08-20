---
'@stone-js/resources': minor
'@stone-js/openapi': patch
'@stone-js/validation': patch
'@stone-js/auth': patch
'@stone-js/authz': patch
'@stone-js/mcp-dev': patch
---

Resources declare what leaves as a schema, and hold themselves to it.

A projection written as code answered "what does this endpoint return?" only to someone who read it
and trusted it: nothing checked it, nothing documented it, and a field added to the model later leaked
because a mapping was not updated. A resource now declares a **schema**, in whatever dialect the
application already validates input with, and that one declaration does three jobs — it *is* the
projection (what it does not describe is not exposed), it validates the response before it is sent,
and `@stone-js/openapi` derives the output contract from it.

- `schema(context)` is the contract. `fragments(context)` names subsets a caller may select through a
  configurable query parameter (`?view=summary` by default), each a documented contract of its own
  rather than an ad-hoc filter.
- `data(model, context)` is an optional, asynchronous hook resolved from the container: fetch a
  relation, translate a label, compute a total. Whatever it returns is what the schema validates.
- `item`, `collection` and `response` are asynchronous. The previous synchronous path turned an async
  projection into `{}` without a word.
- A breach raises `ResourceContractError` naming the field that failed. It fires on a genuine breach,
  never on a difference, since a schema strips what it does not describe. `onViolation: 'warn'` trades
  integrity for availability, explicitly.
- The context now carries the authenticated principal and the event, so a resource deciding what a
  caller may see no longer has to be told by the handler.

**Fixes a defect that made route-declared resources unusable with a response decorator.**
`@JsonHttpResponse(201)` wraps the method itself, so by the time route middleware ran the handler had
already produced a response; projecting that object produced an empty payload and dropped the status.
The payload is now shaped in place, and the status, headers and everything else the handler chose are
left alone.

Also fixed, all found by consumers rather than by us:

- `@ValidationSchema` was **invisible to TypeScript**: the barrel exported an interface and a decorator
  of the same name, and TypeScript drops a name two `export *` both provide. The interface is now
  `NativeSchema`, matching the `isNativeSchema` guard that already existed.
- `@stone-js/auth`'s `AuthorizationError` is now `InsufficientScopeError`. It is thrown for a missing
  scope, and it shared a name with `@stone-js/authz`'s error for a policy denial, so an application
  mapping errors had to map two identical names from two packages.
- The auth documentation described an `Authenticator` with `authenticate(event)` that was never
  shipped; it now documents `resolveUser`, which is the real extension point, and `event.getUser()`
  rather than `event.get('user')` — the principal travels through a resolver, so the generic accessor
  never reached it. The same mistake was in this module's own code.
- Two decorator examples showed options that do not exist (`@Validation({ abortEarly })`,
  `@Authz({ abilities })`); they now show `schemas` and `resolveAbility`.
