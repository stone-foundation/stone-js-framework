[**Auth**](../../../README.md)

***

[Auth](../../../README.md) / [middleware/AuthenticateMiddleware](../README.md) / AuthenticateMiddleware

# Class: AuthenticateMiddleware

Kernel/route middleware that authenticates the request from its `Authorization: Bearer` token.

If a token is present it is verified (an invalid/expired token raises `AuthenticationError` →
`401`); the verified claims are stored on the event (`auth` metadata) and the mapped principal
is exposed via `event.getUser()`. If no token is present the request continues anonymously —
enforce presence per route with `requireAuth()` / `requireScopes()`.

## Constructors

### Constructor

> **new AuthenticateMiddleware**(`dependencies`): `AuthenticateMiddleware`

#### Parameters

##### dependencies

Auto-wired container services.

###### authenticator

[`IAuthenticator`](../../../declarations/interfaces/IAuthenticator.md)

###### blueprint

`IBlueprint`

#### Returns

`AuthenticateMiddleware`

## Methods

### handle()

> **handle**(`event`, `next`): `Promise`\<`OutgoingHttpResponse`\>

#### Parameters

##### event

`IncomingHttpEvent`

The incoming event.

##### next

`NextMiddleware`\<`IncomingHttpEvent`, `OutgoingHttpResponse`\>

The next middleware.

#### Returns

`Promise`\<`OutgoingHttpResponse`\>

The outgoing response.
