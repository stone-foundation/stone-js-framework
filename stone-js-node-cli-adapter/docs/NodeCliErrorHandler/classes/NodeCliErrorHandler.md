# Class: NodeCliErrorHandler

Class representing an NodeCliErrorHandler.

## Implements

- `IAdapterErrorHandler`\<[`NodeCliEvent`](../../declarations/interfaces/NodeCliEvent.md), [`RawResponse`](../../declarations/type-aliases/RawResponse.md), [`NodeCliExecutionContext`](../../declarations/type-aliases/NodeCliExecutionContext.md)\>

## Constructors

### Constructor

```ts
new NodeCliErrorHandler(options): NodeCliErrorHandler;
```

Create an NodeCliErrorHandler.

#### Parameters

##### options

[`NodeCliErrorHandlerOptions`](../interfaces/NodeCliErrorHandlerOptions.md)

NodeCliErrorHandler options.

#### Returns

`NodeCliErrorHandler`

## Methods

### handle()

```ts
handle(error, context): AdapterEventBuilderType<number>;
```

Handle an error.

#### Parameters

##### error

`Error`

The error to handle.

##### context

`AdapterErrorContext`\<[`NodeCliEvent`](../../declarations/interfaces/NodeCliEvent.md), `number`, [`CommandBuilder`](../../declarations/type-aliases/CommandBuilder.md)\>

The context of the adapter.

#### Returns

`AdapterEventBuilderType`\<`number`\>

The raw response builder.

#### Implementation of

```ts
IAdapterErrorHandler.handle
```
