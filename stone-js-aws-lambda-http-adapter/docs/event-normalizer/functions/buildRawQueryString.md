# Function: buildRawQueryString()

```ts
function buildRawQueryString(event, version): string;
```

Build the raw query string from whichever representation the trigger provides.

v2 gives the fidelity-preserving `rawQueryString`. v1/ALB give an object (single value) and
optionally `multiValueQueryStringParameters` (preferred, preserves repeated keys). Values are
URL-encoded so repeated/array values survive.

## Parameters

### event

[`AwsLambdaHttpEvent`](../../declarations/interfaces/AwsLambdaHttpEvent.md)

The raw Lambda event.

### version

[`AwsHttpEventVersion`](../type-aliases/AwsHttpEventVersion.md)

The detected trigger family.

## Returns

`string`

The raw query string (no leading `?`).
