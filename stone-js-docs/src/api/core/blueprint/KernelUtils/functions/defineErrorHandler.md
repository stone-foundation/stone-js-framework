# Function: defineErrorHandler()

Registers a kernel-level error handler in the blueprint.

This utility defines a structured error handler (function, factory, or class) for one or more error types,
and adds it to the `stone.kernel.errorHandlers` blueprint section.

## Param

The error handler module (function, factory, or class).

## Param

Metadata defining the error types it handles, and type flags.

## Call Signature

```ts
function defineErrorHandler<U, V>(module, options): Partial<StoneBlueprint<U>>;
```

Defines a function-based error handler.

### Type Parameters

#### U

`U` *extends* [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md) = [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md)

#### V

`V` = [`OutgoingResponse`](../../../events/OutgoingResponse/classes/OutgoingResponse.md)

### Parameters

#### module

[`FunctionalErrorHandler`](../../../declarations/type-aliases/FunctionalErrorHandler.md)\<`U`, `V`\>

The error handler function.

#### options

[`ErrorHandlerOptions`](../../../declarations/interfaces/ErrorHandlerOptions.md) & `object`

The error types and metadata.

### Returns

`Partial`\<[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\<`U`\>\>

A partial StoneBlueprint with the error handler(s) registered.

### Param

The error handler module (function, factory, or class).

### Param

Metadata defining the error types it handles, and type flags.

## Call Signature

```ts
function defineErrorHandler<U, V>(module, options): Partial<StoneBlueprint<U>>;
```

Defines a factory-based error handler.

### Type Parameters

#### U

`U` *extends* [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md) = [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md)

#### V

`V` = [`OutgoingResponse`](../../../events/OutgoingResponse/classes/OutgoingResponse.md)

### Parameters

#### module

[`FactoryErrorHandler`](../../../declarations/type-aliases/FactoryErrorHandler.md)\<`U`, `V`\>

The factory function that returns an error handler.

#### options

[`ErrorHandlerOptions`](../../../declarations/interfaces/ErrorHandlerOptions.md) & `object`

The error types and metadata.

### Returns

`Partial`\<[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\<`U`\>\>

A partial StoneBlueprint with the error handler(s) registered.

### Param

The error handler module (function, factory, or class).

### Param

Metadata defining the error types it handles, and type flags.

## Call Signature

```ts
function defineErrorHandler<U, V>(module, options): Partial<StoneBlueprint<U>>;
```

Defines a class-based error handler.

### Type Parameters

#### U

`U` *extends* [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md) = [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md)

#### V

`V` = [`OutgoingResponse`](../../../events/OutgoingResponse/classes/OutgoingResponse.md)

### Parameters

#### module

[`IErrorHandlerClass`](../../../declarations/type-aliases/IErrorHandlerClass.md)\<`U`, `V`\>

The error handler class.

#### options

[`ErrorHandlerOptions`](../../../declarations/interfaces/ErrorHandlerOptions.md) & `object`

The error types and metadata.

### Returns

`Partial`\<[`StoneBlueprint`](../../../options/StoneBlueprint/interfaces/StoneBlueprint.md)\<`U`\>\>

A partial StoneBlueprint with the error handler(s) registered.

### Param

The error handler module (function, factory, or class).

### Param

Metadata defining the error types it handles, and type flags.
