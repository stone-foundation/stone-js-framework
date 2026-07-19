[**Auth**](../../README.md)

***

[Auth](../../README.md) / [AuthServiceProvider](../README.md) / AuthServiceProvider

# Class: AuthServiceProvider

Registers the [Authenticator](../../Authenticator/classes/Authenticator.md) service (singleton) from `stone.auth` config, aliased as
`authenticator`/`Authenticator`, so middleware, guards and handlers can resolve it.

## Implements

- `IServiceProvider`

## Constructors

### Constructor

> **new AuthServiceProvider**(`container`): `AuthServiceProvider`

#### Parameters

##### container

`IContainer`

The service container.

#### Returns

`AuthServiceProvider`

## Methods

### register()

> **register**(): `Promiseable`\<`void`\>

Register the authentication service.

#### Returns

`Promiseable`\<`void`\>

#### Implementation of

`IServiceProvider.register`
