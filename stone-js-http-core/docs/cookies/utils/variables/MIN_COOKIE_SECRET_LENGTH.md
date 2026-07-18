# Variable: MIN\_COOKIE\_SECRET\_LENGTH

```ts
const MIN_COOKIE_SECRET_LENGTH: 32 = 32;
```

Minimum length required of a cookie-signing secret.

Cookie signatures use HMAC-SHA256; a weak or empty secret makes the signature trivially
forgeable. 32 characters (~256 bits when random) is the floor for a usable secret. A shorter
or empty secret is rejected loudly rather than silently producing a forgeable signature.
