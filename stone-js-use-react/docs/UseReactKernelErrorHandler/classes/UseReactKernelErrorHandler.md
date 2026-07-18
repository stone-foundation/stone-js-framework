# Class: UseReactKernelErrorHandler

Class representing an UseReactUseReactKernelErrorHandler.

Kernel level error handler for React applications.

## Implements

- `IErrorHandler`\<[`ReactIncomingEvent`](../../declarations/type-aliases/ReactIncomingEvent.md), [`UseReactErrorResponseType`](../type-aliases/UseReactErrorResponseType.md)\>

## Constructors

### Constructor

```ts
new UseReactKernelErrorHandler(options): UseReactKernelErrorHandler;
```

Create an UseReactUseReactKernelErrorHandler.

#### Parameters

##### options

UseReactUseReactKernelErrorHandler options.

###### blueprint

`IBlueprint`

#### Returns

`UseReactKernelErrorHandler`

## Methods

### handle()

```ts
handle(error): UseReactErrorResponseType;
```

Handle an error.

#### Parameters

##### error

`any`

The error to handle.

#### Returns

[`UseReactErrorResponseType`](../type-aliases/UseReactErrorResponseType.md)

The outgoing http response.

#### Implementation of

```ts
IErrorHandler.handle
```
