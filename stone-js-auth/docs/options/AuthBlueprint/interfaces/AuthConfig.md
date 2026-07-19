[**Auth**](../../../README.md)

***

[Auth](../../../README.md) / [options/AuthBlueprint](../README.md) / AuthConfig

# Interface: AuthConfig

Authentication configuration bucket (`stone.auth`).

## Extends

- [`AuthOptions`](../../../declarations/interfaces/AuthOptions.md)

## Properties

### algorithm?

> `optional` **algorithm?**: `string`

Default signing algorithm (default `HS256`).

#### Inherited from

[`AuthOptions`](../../../declarations/interfaces/AuthOptions.md).[`algorithm`](../../../declarations/interfaces/AuthOptions.md#algorithm)

***

### algorithms?

> `optional` **algorithms?**: `string`[]

Accepted verification algorithms.

#### Inherited from

[`AuthOptions`](../../../declarations/interfaces/AuthOptions.md).[`algorithms`](../../../declarations/interfaces/AuthOptions.md#algorithms)

***

### audience?

> `optional` **audience?**: `string` \| `string`[]

Default audience stamped on and expected in tokens.

#### Inherited from

[`AuthOptions`](../../../declarations/interfaces/AuthOptions.md).[`audience`](../../../declarations/interfaces/AuthOptions.md#audience)

***

### clockTolerance?

> `optional` **clockTolerance?**: `string` \| `number`

Clock skew tolerance for verification.

#### Inherited from

[`AuthOptions`](../../../declarations/interfaces/AuthOptions.md).[`clockTolerance`](../../../declarations/interfaces/AuthOptions.md#clocktolerance)

***

### expiresIn?

> `optional` **expiresIn?**: `string` \| `number`

Default token lifetime (default `'1h'`).

#### Inherited from

[`AuthOptions`](../../../declarations/interfaces/AuthOptions.md).[`expiresIn`](../../../declarations/interfaces/AuthOptions.md#expiresin)

***

### issuer?

> `optional` **issuer?**: `string`

Default issuer stamped on and expected in tokens.

#### Inherited from

[`AuthOptions`](../../../declarations/interfaces/AuthOptions.md).[`issuer`](../../../declarations/interfaces/AuthOptions.md#issuer)

***

### jwksUri?

> `optional` **jwksUri?**: `string`

Remote JWKS endpoint for verification (OAuth/OIDC).

#### Inherited from

[`AuthOptions`](../../../declarations/interfaces/AuthOptions.md).[`jwksUri`](../../../declarations/interfaces/AuthOptions.md#jwksuri)

***

### privateKey?

> `optional` **privateKey?**: `string`

PEM private key for asymmetric signing (RS/ES/PS).

#### Inherited from

[`AuthOptions`](../../../declarations/interfaces/AuthOptions.md).[`privateKey`](../../../declarations/interfaces/AuthOptions.md#privatekey)

***

### publicKey?

> `optional` **publicKey?**: `string`

PEM public key for asymmetric verification.

#### Inherited from

[`AuthOptions`](../../../declarations/interfaces/AuthOptions.md).[`publicKey`](../../../declarations/interfaces/AuthOptions.md#publickey)

***

### resolveUser?

> `optional` **resolveUser?**: (`claims`) => `unknown`

Maps verified claims into the application principal attached to the event.

#### Parameters

##### claims

[`JwtClaims`](../../../declarations/interfaces/JwtClaims.md)

#### Returns

`unknown`

#### Inherited from

[`AuthOptions`](../../../declarations/interfaces/AuthOptions.md).[`resolveUser`](../../../declarations/interfaces/AuthOptions.md#resolveuser)

***

### secret?

> `optional` **secret?**: `string`

Shared secret for HMAC (HS256/384/512).

#### Inherited from

[`AuthOptions`](../../../declarations/interfaces/AuthOptions.md).[`secret`](../../../declarations/interfaces/AuthOptions.md#secret)
