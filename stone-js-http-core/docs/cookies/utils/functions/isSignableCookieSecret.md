# Function: isSignableCookieSecret()

```ts
function isSignableCookieSecret(secret): secret is string;
```

Whether a secret is strong enough to sign/verify cookies.

## Parameters

### secret

`unknown`

The candidate secret.

## Returns

`secret is string`

True when the secret is a string of at least [MIN\_COOKIE\_SECRET\_LENGTH](../variables/MIN_COOKIE_SECRET_LENGTH.md) chars.
