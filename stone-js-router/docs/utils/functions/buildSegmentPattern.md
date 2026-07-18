# Function: buildSegmentPattern()

```ts
function buildSegmentPattern(constraint?, name?): string;
```

Builds a path segment pattern based on a route segment constraint.

All repetition quantifiers (`*`, `+`) expand to a **linear**, non-ambiguous form
(`segment(?:/segment)*`) so the resulting regex cannot backtrack catastrophically.

## Parameters

### constraint?

`Partial`\<[`RouteSegmentConstraint`](../../declarations/interfaces/RouteSegmentConstraint.md)\>

Partial route segment constraint for path matching.

### name?

`string`

The capture-group name to assign to the parameter (if any).

## Returns

`string`

A string representing the path pattern.
