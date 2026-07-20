[**Authz**](../../../README.md)

***

[Authz](../../../README.md) / [middleware/authorize](../README.md) / authorize

# Function: authorize()

> **authorize**(`action`, `subject`, `field?`): `FunctionalMiddleware`\<`IncomingEvent`, `OutgoingResponse`\>

Route guard that authorizes `action` on `subject` against the request's ability.

Reads the ability attached by `AbilityMiddleware`; if it is missing or denies the action, it
throws an `AuthorizationError` (403). Attach it to a route's `middleware`
(`@Delete('/posts/:id', { middleware: [authorize('delete', 'Post')] })`). The same CASL rules
power the frontend, so the UI and the API stay in lockstep.

## Parameters

### action

`string`

The action (e.g. `'update'`, `'delete'`, `'manage'`).

### subject

[`Subject`](../../../declarations/type-aliases/Subject.md)

The subject type or instance.

### field?

`string`

Optional field-level check.

## Returns

`FunctionalMiddleware`\<`IncomingEvent`, `OutgoingResponse`\>

A functional middleware.
