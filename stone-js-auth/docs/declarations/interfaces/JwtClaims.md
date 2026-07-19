[**Auth**](../../README.md)

***

[Auth](../../README.md) / [declarations](../README.md) / JwtClaims

# Interface: JwtClaims

Standard + custom JWT claims.

## Extends

- `Record`\<`string`, `unknown`\>

## Indexable

> \[`key`: `string`\]: `unknown`

## Properties

### aud?

> `optional` **aud?**: `string` \| `string`[]

Audience.

***

### exp?

> `optional` **exp?**: `number`

Expiration time (seconds since epoch).

***

### iat?

> `optional` **iat?**: `number`

Issued-at time (seconds since epoch).

***

### iss?

> `optional` **iss?**: `string`

Issuer.

***

### scope?

> `optional` **scope?**: `string` \| `string`[]

Space- or array-delimited OAuth scopes.

***

### sub?

> `optional` **sub?**: `string`

Subject (the principal the token is about).
