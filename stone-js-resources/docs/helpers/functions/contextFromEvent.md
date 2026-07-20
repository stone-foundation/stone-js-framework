[**Resources**](../../README.md)

***

[Resources](../../README.md) / [helpers](../README.md) / contextFromEvent

# Function: contextFromEvent()

> **contextFromEvent**(`event`, `extra?`): [`ResourceContext`](../../declarations/interfaces/ResourceContext.md)

Builds a [ResourceContext](../../declarations/interfaces/ResourceContext.md) from an incoming event's `fields` and `include` query
parameters (comma-separated). Agnostic: the event only needs a `get(key)` method.

## Parameters

### event

Anything with `get(key)` (an `IncomingHttpEvent`, a URL search wrapper, …).

#### get

\<`T`\>(`key`, `fallback?`) => `T`

### extra?

[`ResourceContext`](../../declarations/interfaces/ResourceContext.md) = `{}`

Extra context to merge in.

## Returns

[`ResourceContext`](../../declarations/interfaces/ResourceContext.md)

The resource context.
