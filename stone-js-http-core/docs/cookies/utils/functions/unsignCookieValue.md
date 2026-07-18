# Function: unsignCookieValue()

```ts
function unsignCookieValue(value, secret): string | false;
```

Unsign the cookie value.

## Parameters

### value

`unknown`

The signed value.

### secret

`string`

Secret for unsigning (must be strong, see [isSignableCookieSecret](isSignableCookieSecret.md)).

## Returns

`string` \| `false`

## Throws

If the value is not a signed string or the secret is weak/empty.
