# Function: signCookieValue()

```ts
function signCookieValue(value, secret): string;
```

Sign the cookie value.

## Parameters

### value

`unknown`

The value to sign.

### secret

`string`

Secret for signing (must be strong, see [isSignableCookieSecret](isSignableCookieSecret.md)).

## Returns

`string`

## Throws

If the value is not a string, is already signed, or the secret is weak/empty.
