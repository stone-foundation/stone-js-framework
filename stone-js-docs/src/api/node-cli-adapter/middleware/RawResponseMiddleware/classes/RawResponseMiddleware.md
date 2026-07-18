# Class: RawResponseMiddleware

Middleware for handling raw responses in the Node CLI adapter.

This middleware processes outgoing responses and attaches the necessary exit code, and status codes to the raw response.

## Constructors

### Constructor

```ts
new RawResponseMiddleware(): RawResponseMiddleware;
```

#### Returns

`RawResponseMiddleware`

## Methods

### handle()

```ts
handle(context, next): Promise<NodeCliAdapterResponseBuilder>;
```

Handles the outgoing response, processes it, and invokes the next middleware in the pipeline.

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
