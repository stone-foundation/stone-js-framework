# Function: buildDomainPattern()

```ts
function buildDomainPattern(constraint?, name?): string | undefined;
```

Builds a domain pattern based on a route segment constraint.

## Parameters

### constraint?

`Partial`\<[`RouteSegmentConstraint`](../../declarations/interfaces/RouteSegmentConstraint.md)\>

Partial route segment constraint for domain matching.

### name?

`string`

The capture-group name to assign to the parameter (if any).

## Returns

`string` \| `undefined`

A string representing the domain pattern or undefined.
