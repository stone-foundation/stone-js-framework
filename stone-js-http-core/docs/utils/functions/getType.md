# Function: getType()

```ts
function getType(value, fallback?): string;
```

Get message content type.

## Parameters

### value

`string` \| `IncomingMessage`

The incoming message or content type string.

### fallback?

`string` = `'text/plain'`

Fallback content type if parsing fails.

## Returns

`string`

The content type of the message.
