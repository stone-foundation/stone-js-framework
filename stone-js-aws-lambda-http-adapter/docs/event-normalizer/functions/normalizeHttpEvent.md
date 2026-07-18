# Function: normalizeHttpEvent()

```ts
function normalizeHttpEvent(event): NormalizedHttpEvent;
```

Normalize any AWS HTTP Lambda event into the canonical [NormalizedHttpEvent](../interfaces/NormalizedHttpEvent.md).

## Parameters

### event

[`AwsLambdaHttpEvent`](../../declarations/interfaces/AwsLambdaHttpEvent.md)

The raw Lambda event.

## Returns

[`NormalizedHttpEvent`](../interfaces/NormalizedHttpEvent.md)

The normalized request.
