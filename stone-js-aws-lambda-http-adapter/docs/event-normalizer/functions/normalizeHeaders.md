# Function: normalizeHeaders()

```ts
function normalizeHeaders(event): Record<string, string>;
```

Normalize headers to lower-cased keys, merging single and multi-value headers.

## Parameters

### event

[`AwsLambdaHttpEvent`](../../declarations/interfaces/AwsLambdaHttpEvent.md)

The raw Lambda event.

## Returns

`Record`\<`string`, `string`\>

Lower-cased headers with multi-value entries joined by `, `.
