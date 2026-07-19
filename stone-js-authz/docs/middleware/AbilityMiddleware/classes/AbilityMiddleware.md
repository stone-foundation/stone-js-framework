[**Authz**](../../../README.md)

***

[Authz](../../../README.md) / [middleware/AbilityMiddleware](../README.md) / AbilityMiddleware

# Class: AbilityMiddleware

Kernel/route middleware that builds the CASL ability for the current principal and attaches it
to the event (`ability` metadata), so route guards (`authorize(...)`) and handlers can consult
it without rebuilding it. The principal comes from `event.getUser()` (populated by
`@stone-js/auth`, or anonymous).

## Constructors

### Constructor

> **new AbilityMiddleware**(`dependencies`): `AbilityMiddleware`

#### Parameters

##### dependencies

Auto-wired container services.

###### authorizer

[`IAuthorizer`](../../../declarations/interfaces/IAuthorizer.md)

#### Returns

`AbilityMiddleware`

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
