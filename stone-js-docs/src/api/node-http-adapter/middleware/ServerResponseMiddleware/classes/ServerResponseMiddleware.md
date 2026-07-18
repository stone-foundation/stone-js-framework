# Class: ServerResponseMiddleware

Middleware for handling server responses and transforming them into the appropriate HTTP responses.

This middleware processes outgoing responses and attaches the necessary headers, status codes,
and body content to the HTTP response.

## Constructors

### Constructor

```ts
new ServerResponseMiddleware(options): ServerResponseMiddleware;
```

Create a ServerResponseMiddleware.

#### Parameters

##### options

Options for creating the ServerResponseMiddleware.

###### blueprint

`IBlueprint`

#### Returns

`ServerResponseMiddleware`

## Methods

### handle()

```ts
handle(context, next): Promise<NodeHttpAdapterResponseBuilder>;
```

Handles the outgoing response, processes it, and invokes the next middleware in the pipeline.

#### Parameters

##### context

[`NodeHttpAdapterContext`](../../../declarations/interfaces/NodeHttpAdapterContext.md)

The adapter context containing the raw event, execution context, and other data.

##### next

`NextMiddleware`\<[`NodeHttpAdapterContext`](../../../declarations/interfaces/NodeHttpAdapterContext.md), [`NodeHttpAdapterResponseBuilder`](../../../declarations/type-aliases/NodeHttpAdapterResponseBuilder.md)\>

The next middleware to be invoked in the pipeline.

#### Returns

`Promise`\<[`NodeHttpAdapterResponseBuilder`](../../../declarations/type-aliases/NodeHttpAdapterResponseBuilder.md)\>

A promise resolving to the processed context.

#### Throws

If required components are missing in the context.
