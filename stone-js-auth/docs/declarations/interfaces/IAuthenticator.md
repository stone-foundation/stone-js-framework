[**Auth**](../../README.md)

***

[Auth](../../README.md) / [declarations](../README.md) / IAuthenticator

# Interface: IAuthenticator

The authenticator service contract.

## Properties

### decode

> **decode**: \<`T`\>(`token`) => `T`

Decode a token without verifying it (never trust the result for authorization).

#### Type Parameters

##### T

`T` *extends* [`JwtClaims`](JwtClaims.md) = [`JwtClaims`](JwtClaims.md)

#### Parameters

##### token

`string`

#### Returns

`T`

***

### sign

> **sign**: (`claims`, `options?`) => `Promise`\<`string`\>

Sign a token from claims.

#### Parameters

##### claims

[`JwtClaims`](JwtClaims.md)

##### options?

[`SignOptions`](SignOptions.md)

#### Returns

`Promise`\<`string`\>

***

### verify

> **verify**: \<`T`\>(`token`, `options?`) => `Promise`\<`T`\>

Verify a token and return its claims (throws on invalid/expired).

#### Type Parameters

##### T

`T` *extends* [`JwtClaims`](JwtClaims.md) = [`JwtClaims`](JwtClaims.md)

#### Parameters

##### token

`string`

##### options?

[`VerifyOptions`](VerifyOptions.md)

#### Returns

`Promise`\<`T`\>
