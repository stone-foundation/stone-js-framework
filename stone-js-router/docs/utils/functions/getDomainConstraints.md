# Function: getDomainConstraints()

```ts
function getDomainConstraints(options): 
  | Partial<RouteSegmentConstraint>
  | undefined;
```

Extracts domain constraints from route options.

## Parameters

### options

[`RegexPatternOptions`](../../declarations/interfaces/RegexPatternOptions.md)

The route options to extract domain constraints from.

## Returns

  \| `Partial`\<[`RouteSegmentConstraint`](../../declarations/interfaces/RouteSegmentConstraint.md)\>
  \| `undefined`

Partial route segment constraint for the domain or undefined.
