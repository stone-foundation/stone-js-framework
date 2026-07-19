[**Validation**](../../README.md)

***

[Validation](../../README.md) / [ValidationServiceProvider](../README.md) / ValidationServiceProvider

# Class: ValidationServiceProvider

Registers the [Validator](../../Validator/classes/Validator.md) service (singleton) in the container, aliased as
`validator`/`Validator`, so middleware, handlers and services can resolve it.

## Implements

- `IServiceProvider`

## Constructors

### Constructor

> **new ValidationServiceProvider**(`container`): `ValidationServiceProvider`

#### Parameters

##### container

`IContainer`

The service container.

#### Returns

`ValidationServiceProvider`

## Methods

### register()

> **register**(): `Promiseable`\<`void`\>

Register the validation service.

#### Returns

`Promiseable`\<`void`\>

#### Implementation of

`IServiceProvider.register`
