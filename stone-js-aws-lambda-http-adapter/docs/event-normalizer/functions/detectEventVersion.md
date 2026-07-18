# Function: detectEventVersion()

```ts
function detectEventVersion(event): AwsHttpEventVersion;
```

Detect which AWS HTTP trigger produced the event.

## Parameters

### event

[`AwsLambdaHttpEvent`](../../declarations/interfaces/AwsLambdaHttpEvent.md)

The raw Lambda event.

## Returns

[`AwsHttpEventVersion`](../type-aliases/AwsHttpEventVersion.md)

The trigger family.
