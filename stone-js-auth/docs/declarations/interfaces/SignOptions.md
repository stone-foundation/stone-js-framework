[**Auth**](../../README.md)

***

[Auth](../../README.md) / [declarations](../README.md) / SignOptions

# Interface: SignOptions

Options for signing a token.

## Properties

### algorithm?

> `optional` **algorithm?**: `string`

Signing algorithm. Falls back to `stone.auth.algorithm` (default `HS256`).

***

### audience?

> `optional` **audience?**: `string` \| `string`[]

Audience (`aud`). Falls back to `stone.auth.audience`.

***

### expiresIn?

> `optional` **expiresIn?**: `string` \| `number`

Lifetime, e.g. `'1h'`, `'15m'`, or seconds. Falls back to `stone.auth.expiresIn`.

***

### issuer?

> `optional` **issuer?**: `string`

Issuer (`iss`). Falls back to `stone.auth.issuer`.

***

### subject?

> `optional` **subject?**: `string`

Subject (`sub`).
