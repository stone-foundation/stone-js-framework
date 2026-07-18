# Function: getRawBody()

```ts
function getRawBody(event): unknown;
```

Extract the raw request body exactly as received, decoding base64 to a Buffer when needed.

This is what the adapter exposes as `metadata.rawBody`: the untouched payload the client sent,
available to consumers even when no body-parsing middleware is installed. Binary payloads are
returned as a `Buffer` (never a lossy UTF-8 round-trip); text payloads as a string. A
non-string, non-base64 body (e.g. a pre-parsed object from a test/custom integration) is
returned as-is.

## Parameters

### event

[`AwsLambdaHttpEvent`](../../declarations/interfaces/AwsLambdaHttpEvent.md)

The raw Lambda event.

## Returns

`unknown`

The raw body as a Buffer, string, the original value, or undefined.
