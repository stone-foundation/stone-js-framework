# Function: getDomainConstraints()

```ts
function getDomainConstraints(options): 
  | undefined
| Partial<RouteSegmentConstraint>;
```

Extracts domain constraints from route options.

## Parameters

### options

[`RegexPatternOptions`](../../declarations/interfaces/RegexPatternOptions.md)

The route options to extract domain constraints from.

## Returns

  \| `undefined`
  \| `Partial`\<[`RouteSegmentConstraint`](../../declarations/interfaces/RouteSegmentConstraint.md)\>

Partial route segment constraint for the domain or undefined.
