# Class: BrowserErrorHandler

Class representing an BrowserErrorHandler.

## Implements

- `IAdapterErrorHandler`\<[`BrowserEvent`](../../declarations/type-aliases/BrowserEvent.md), [`BrowserResponse`](../../declarations/type-aliases/BrowserResponse.md), [`BrowserContext`](../../declarations/type-aliases/BrowserContext.md)\>

## Constructors

### Constructor

```ts
new BrowserErrorHandler(options): BrowserErrorHandler;
```

Create an BrowserErrorHandler.

#### Parameters

##### options

[`BrowserErrorHandlerOptions`](../interfaces/BrowserErrorHandlerOptions.md)

BrowserErrorHandler options.

#### Returns

`BrowserErrorHandler`

## Methods

### handle()

```ts
handle(error, context): AdapterEventBuilderType<unknown>;
```

Handle an error.

#### Parameters

##### error

`Error`

The error to handle.

##### context

`AdapterErrorContext`\<[`BrowserEvent`](../../declarations/type-aliases/BrowserEvent.md), `unknown`, `Window` & *typeof* `globalThis`\>

The context of the adapter.

#### Returns

`AdapterEventBuilderType`\<`unknown`\>

The raw response builder.

#### Implementation of

```ts
IAdapterErrorHandler.handle
```
