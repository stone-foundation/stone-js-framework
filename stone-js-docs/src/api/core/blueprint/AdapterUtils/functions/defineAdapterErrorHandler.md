# Function: defineAdapterErrorHandler()

Registers an adapter error handler in the blueprint with appropriate metadata.

This function creates and injects a middleware into the blueprint that registers
an error handler for a specific adapter based on platform or alias.

## Param

The handler function, factory, or class.

## Param

Options including `platform`, `adapterAlias`, and `error` type(s) to handle.

## Call Signature

```ts
function defineAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>(module, options): Partial<StoneBlueprint>;
```

Defines a function-based adapter error handler.

This overload is used for plain function handlers that handle specific adapter errors.

### Type Parameters

#### RawEventType

`RawEventType` = `any`

#### RawResponseType

`RawResponseType` = `any`

#### ExecutionContextType

`ExecutionContextType` = `any`

### Parameters

#### module

[`FunctionalAdapterErrorHandler`](../../../declarations/type-aliases/FunctionalAdapterErrorHandler.md)\<`RawEventType`, `RawResponseType`, `ExecutionContextType`\>

The function to handle the adapter error.

#### options

[`AdapterErrorHandlerOptions`](../../../declarations/interfaces/AdapterErrorHandlerOptions.md) & `object`

Metadata describing when to apply the handler (e.g. platform, alias, error types).

### Returns

`Partial`\<[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\>

A Stone.js blueprint fragment that adds the registration middleware.

### Param

The handler function, factory, or class.

### Param

Options including `platform`, `adapterAlias`, and `error` type(s) to handle.

## Call Signature

```ts
function defineAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>(module, options): Partial<StoneBlueprint>;
```

Defines a factory-based adapter error handler.

This overload allows defining an adapter error handler as a factory function.

### Type Parameters

#### RawEventType

`RawEventType` = `any`

#### RawResponseType

`RawResponseType` = `any`

#### ExecutionContextType

`ExecutionContextType` = `any`

### Parameters

#### module

[`FactoryAdapterErrorHandler`](../../../declarations/type-aliases/FactoryAdapterErrorHandler.md)\<`RawEventType`, `RawResponseType`, `ExecutionContextType`\>

A factory that returns the adapter error handler function.

#### options

[`AdapterErrorHandlerOptions`](../../../declarations/interfaces/AdapterErrorHandlerOptions.md) & `object`

Metadata describing when to apply the handler (e.g. platform, alias, error types).

### Returns

`Partial`\<[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\>

A Stone.js blueprint fragment that adds the registration middleware.

### Param

The handler function, factory, or class.

### Param

Options including `platform`, `adapterAlias`, and `error` type(s) to handle.

## Call Signature

```ts
function defineAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>(module, options): Partial<StoneBlueprint>;
```

Defines a class-based adapter error handler.

This overload allows defining an adapter error handler as a class.

### Type Parameters

#### RawEventType

`RawEventType` = `any`

#### RawResponseType

`RawResponseType` = `any`

#### ExecutionContextType

`ExecutionContextType` = `any`

### Parameters

#### module

[`IAdapterErrorHandlerClass`](../../../declarations/type-aliases/IAdapterErrorHandlerClass.md)\<`RawEventType`, `RawResponseType`, `ExecutionContextType`\>

A class that implements the adapter error handler logic.

#### options

[`AdapterErrorHandlerOptions`](../../../declarations/interfaces/AdapterErrorHandlerOptions.md) & `object`

Metadata describing when to apply the handler (e.g. platform, alias, error types).

### Returns

`Partial`\<[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\>

A Stone.js blueprint fragment that adds the registration middleware.

### Param

The handler function, factory, or class.

### Param

Options including `platform`, `adapterAlias`, and `error` type(s) to handle.
