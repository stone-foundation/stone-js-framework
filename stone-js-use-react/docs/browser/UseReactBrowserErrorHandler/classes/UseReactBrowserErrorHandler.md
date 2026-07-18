# Class: UseReactBrowserErrorHandler

Class representing an UseReactBrowserErrorHandler.

Adapter level error handler for React applications.

## Implements

- `IAdapterErrorHandler`\<`unknown`, `unknown`, `unknown`\>

## Constructors

### Constructor

```ts
new UseReactBrowserErrorHandler(options): UseReactBrowserErrorHandler;
```

Create an UseReactBrowserErrorHandler.

#### Parameters

##### options

[`UseReactBrowserErrorHandlerOptions`](../interfaces/UseReactBrowserErrorHandlerOptions.md)

UseReactBrowserErrorHandler options.

#### Returns

`UseReactBrowserErrorHandler`

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
