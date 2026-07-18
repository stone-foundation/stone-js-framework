# Class: IncomingEventMiddleware

Middleware for handling incoming events in the Node CLI adapter.

This middleware processes the incoming event and prepares it for the next middleware in the pipeline.

## Constructors

### Constructor

```ts
new IncomingEventMiddleware(): IncomingEventMiddleware;
```

#### Returns

`IncomingEventMiddleware`

## Methods

### handle()

```ts
handle(context, next): Promise<NodeCliAdapterResponseBuilder>;
```

Handles the incoming event, processes it, and invokes the next middleware in the pipeline.

#### Parameters

##### context

[`NodeCliAdapterContext`](../../../declarations/interfaces/NodeCliAdapterContext.md)

The adapter context containing the raw event, execution context, and other data.

##### next

`NextMiddleware`\<[`NodeCliAdapterContext`](../../../declarations/interfaces/NodeCliAdapterContext.md), [`NodeCliAdapterResponseBuilder`](../../../declarations/type-aliases/NodeCliAdapterResponseBuilder.md)\>

The next middleware to be invoked in the pipeline.

#### Returns

`Promise`\<[`NodeCliAdapterResponseBuilder`](../../../declarations/type-aliases/NodeCliAdapterResponseBuilder.md)\>

A promise that resolves to the processed context.

#### Throws

If required components are missing in the context.
