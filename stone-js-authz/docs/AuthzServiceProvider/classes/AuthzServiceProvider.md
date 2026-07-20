[**Authz**](../../README.md)

***

[Authz](../../README.md) / [AuthzServiceProvider](../README.md) / AuthzServiceProvider

# Class: AuthzServiceProvider

Registers the [Authorizer](../../Authorizer/classes/Authorizer.md) service (singleton) from `stone.authz` config, aliased as
`authorizer`/`Authorizer`, so middleware, guards and handlers can resolve it.

## Implements

- `IServiceProvider`

## Constructors

### Constructor

> **new AuthzServiceProvider**(`container`): `AuthzServiceProvider`

#### Parameters

##### container

`IContainer`

The service container.

#### Returns

`AuthzServiceProvider`

## Methods

### register()

> **register**(): `Promiseable`\<`void`\>

Register the authorization service.

#### Returns

`Promiseable`\<`void`\>

#### Implementation of

`IServiceProvider.register`
