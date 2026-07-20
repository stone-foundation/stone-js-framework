[**Auth**](../../README.md)

***

[Auth](../../README.md) / [Authenticator](../README.md) / Authenticator

# Class: Authenticator

The authentication service.

Stateless and edge-native: it wraps [jose](https://github.com/panva/jose) to sign and verify
JWTs on Node, the browser, Deno, Bun and the edge — no session store. It supports a shared
secret (HMAC), an asymmetric key pair (RS/ES/PS), and remote JWKS verification for tokens
issued by an external identity provider (OAuth/OIDC), plus issuer/audience/scope checks.

## Implements

- [`IAuthenticator`](../../declarations/interfaces/IAuthenticator.md)

## Constructors

### Constructor

> **new Authenticator**(`options`): `Authenticator`

#### Parameters

##### options

[`AuthOptions`](../../declarations/interfaces/AuthOptions.md)

Authentication options.

#### Returns

`Authenticator`

## Methods

### decode()

> **decode**\<`T`\>(`token`): `T`

Decode a token without verifying it. Never trust the result for authorization decisions.

#### Type Parameters

##### T

`T` *extends* [`JwtClaims`](../../declarations/interfaces/JwtClaims.md) = [`JwtClaims`](../../declarations/interfaces/JwtClaims.md)

#### Parameters

##### token

`string`

The compact JWT.

#### Returns

`T`

The decoded claims.

#### Implementation of

[`IAuthenticator`](../../declarations/interfaces/IAuthenticator.md).[`decode`](../../declarations/interfaces/IAuthenticator.md#decode)

***

### sign()

> **sign**(`claims`, `options?`): `Promise`\<`string`\>

Sign a token from claims.

#### Parameters

##### claims

[`JwtClaims`](../../declarations/interfaces/JwtClaims.md)

The claims to embed.

##### options?

[`SignOptions`](../../declarations/interfaces/SignOptions.md) = `{}`

Per-call signing overrides.

#### Returns

`Promise`\<`string`\>

The signed compact JWT.

#### Implementation of

[`IAuthenticator`](../../declarations/interfaces/IAuthenticator.md).[`sign`](../../declarations/interfaces/IAuthenticator.md#sign)

***

### verify()

> **verify**\<`T`\>(`token`, `options?`): `Promise`\<`T`\>

Verify a token and return its claims.

#### Type Parameters

##### T

`T` *extends* [`JwtClaims`](../../declarations/interfaces/JwtClaims.md) = [`JwtClaims`](../../declarations/interfaces/JwtClaims.md)

#### Parameters

##### token

`string`

The compact JWT.

##### options?

[`VerifyOptions`](../../declarations/interfaces/VerifyOptions.md) = `{}`

Per-call verification overrides.

#### Returns

`Promise`\<`T`\>

The verified claims.

#### Throws

When the token is missing, invalid or expired.

#### Implementation of

[`IAuthenticator`](../../declarations/interfaces/IAuthenticator.md).[`verify`](../../declarations/interfaces/IAuthenticator.md#verify)

***

### create()

> `static` **create**(`options`): `Authenticator`

#### Parameters

##### options

[`AuthOptions`](../../declarations/interfaces/AuthOptions.md)

Authentication options.

#### Returns

`Authenticator`

A new Authenticator.
