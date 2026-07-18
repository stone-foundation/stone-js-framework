# Function: getSegmentsConstraints()

```ts
function getSegmentsConstraints(options): Partial<RouteSegmentConstraint>[];
```

Extracts path segment constraints from route options.

## Parameters

### options

[`RegexPatternOptions`](../../declarations/interfaces/RegexPatternOptions.md)

The route options to extract constraints from.

## Returns

`Partial`\<[`RouteSegmentConstraint`](../../declarations/interfaces/RouteSegmentConstraint.md)\>[]

An array of partial segment constraints for the path.
