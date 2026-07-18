# Function: collectCookies()

```ts
function collectCookies(event, headers): string[];
```

Collect the raw cookie strings, regardless of trigger.

v2 delivers `event.cookies: string[]`. v1/ALB deliver a single `Cookie` header (already merged
into [NormalizedHttpEvent.headers](../interfaces/NormalizedHttpEvent.md#headers)).

## Parameters

### event

[`AwsLambdaHttpEvent`](../../declarations/interfaces/AwsLambdaHttpEvent.md)

The raw Lambda event.

### headers

`Record`\<`string`, `string`\>

The normalized headers.

## Returns

`string`[]

The raw cookie strings.
