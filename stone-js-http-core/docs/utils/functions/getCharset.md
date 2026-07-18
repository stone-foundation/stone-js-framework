# Function: getCharset()

```ts
function getCharset(value, fallback?): string;
```

Get message content charset.

## Parameters

### value

`string` \| `IncomingMessage`

The incoming message or content type string.

### fallback?

`string` = `'utf-8'`

Fallback charset if parsing fails.

## Returns

`string`

The charset of the message.
