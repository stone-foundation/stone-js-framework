# Function: getSegmentsConstraints()

```ts
function getSegmentsConstraints(options): Partial<RouteSegmentConstraint>[];
```

Extracts path segment constraints from route options.

The returned constraints are freshly built objects (no shared/mutated state), so
the caller can safely cache or transform them.

## Parameters

### options

[`RegexPatternOptions`](../../declarations/interfaces/RegexPatternOptions.md)

The route options to extract constraints from.

## Returns

`Partial`\<[`RouteSegmentConstraint`](../../declarations/interfaces/RouteSegmentConstraint.md)\>[]

An array of partial segment constraints for the path.
