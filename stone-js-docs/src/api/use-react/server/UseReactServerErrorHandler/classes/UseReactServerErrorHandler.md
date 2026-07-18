# Class: UseReactServerErrorHandler

Class representing an UseReactServerErrorHandler.

Adapter level error handler for React applications.

## Implements

- `IAdapterErrorHandler`\<`unknown`, `unknown`, `unknown`\>

## Constructors

### Constructor

```ts
new UseReactServerErrorHandler(options): UseReactServerErrorHandler;
```

Create an UseReactServerErrorHandler.

#### Parameters

##### options

[`UseReactServerErrorHandlerOptions`](../interfaces/UseReactServerErrorHandlerOptions.md)

UseReactServerErrorHandler options.

#### Returns

`UseReactServerErrorHandler`

## Methods

### handle()

```ts
handle(error, context): Promise<AdapterEventBuilderType<unknown>>;
```

Handle an error.

#### Parameters

##### error

`any`

The error to handle.

##### context

`AdapterErrorContext`\<`unknown`, `unknown`, `unknown`\>

The context of the adapter.

#### Returns

`Promise`\<`AdapterEventBuilderType`\<`unknown`\>\>

The raw response.

#### Implementation of

```ts
IAdapterErrorHandler.handle
```
