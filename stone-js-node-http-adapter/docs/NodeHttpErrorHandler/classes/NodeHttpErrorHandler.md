# Class: NodeHttpErrorHandler

Class representing an NodeHttpErrorHandler.

## Implements

- `IAdapterErrorHandler`\<`IncomingMessage`, `ServerResponse`, [`NodeHttpServer`](../../declarations/type-aliases/NodeHttpServer.md)\>

## Constructors

### Constructor

```ts
new NodeHttpErrorHandler(options): NodeHttpErrorHandler;
```

Create an NodeHttpErrorHandler.

#### Parameters

##### options

[`NodeHttpErrorHandlerOptions`](../interfaces/NodeHttpErrorHandlerOptions.md)

NodeHttpErrorHandler options.

#### Returns

`NodeHttpErrorHandler`

## Methods

### handle()

```ts
handle(error, context): AdapterEventBuilderType<ServerResponse<IncomingMessage>>;
```

Handle an error.

#### Parameters

##### error

`Error`

The error to handle.

##### context

`AdapterErrorContext`\<`IncomingMessage`, `ServerResponse`\<`IncomingMessage`\>, [`NodeHttpServer`](../../declarations/type-aliases/NodeHttpServer.md)\>

The context of the adapter.

#### Returns

`AdapterEventBuilderType`\<`ServerResponse`\<`IncomingMessage`\>\>

The raw response builder.

#### Implementation of

```ts
IAdapterErrorHandler.handle
```
