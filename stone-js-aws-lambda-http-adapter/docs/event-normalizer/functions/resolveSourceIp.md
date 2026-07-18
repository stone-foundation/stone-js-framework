# Function: resolveSourceIp()

```ts
function resolveSourceIp(
   event, 
   version, 
   headers): string;
```

Resolve the client source IP across triggers.

## Parameters

### event

[`AwsLambdaHttpEvent`](../../declarations/interfaces/AwsLambdaHttpEvent.md)

The raw Lambda event.

### version

[`AwsHttpEventVersion`](../type-aliases/AwsHttpEventVersion.md)

The detected trigger family.

### headers

`Record`\<`string`, `string`\>

The normalized headers.

## Returns

`string`

The source IP (empty string if unknown).
