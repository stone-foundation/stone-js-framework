[**Auth**](../../README.md)

***

[Auth](../../README.md) / [declarations](../README.md) / AuthOptions

# Interface: AuthOptions

Authentication configuration (`stone.auth.*`).

Provide exactly one signing/verification strategy: a shared `secret` (HMAC), an asymmetric
key pair (`privateKey`/`publicKey`, PEM), and/or a remote `jwksUri` (verify tokens from an
external identity provider). `secret` and asymmetric keys can be combined with `jwksUri`
(JWKS wins for verification).

## Extended by

- [`AuthConfig`](../../options/AuthBlueprint/interfaces/AuthConfig.md)

## Properties

### algorithm?

> `optional` **algorithm?**: `string`

Default signing algorithm (default `HS256`).

***

### algorithms?

> `optional` **algorithms?**: `string`[]

Accepted verification algorithms.

***

### audience?

> `optional` **audience?**: `string` \| `string`[]

Default audience stamped on and expected in tokens.

***

### clockTolerance?

> `optional` **clockTolerance?**: `string` \| `number`

Clock skew tolerance for verification.

***

### expiresIn?

> `optional` **expiresIn?**: `string` \| `number`

Default token lifetime (default `'1h'`).

***

### issuer?

> `optional` **issuer?**: `string`

Default issuer stamped on and expected in tokens.

***

### jwksUri?

> `optional` **jwksUri?**: `string`

Remote JWKS endpoint for verification (OAuth/OIDC).

***

### privateKey?

> `optional` **privateKey?**: `string`

PEM private key for asymmetric signing (RS/ES/PS).

***

### publicKey?

> `optional` **publicKey?**: `string`

PEM public key for asymmetric verification.

***

### resolveUser?

> `optional` **resolveUser?**: (`claims`) => `unknown`

Maps verified claims into the application principal attached to the event.

#### Parameters

##### claims

[`JwtClaims`](JwtClaims.md)

#### Returns

`unknown`

***

### secret?

> `optional` **secret?**: `string`

Shared secret for HMAC (HS256/384/512).
