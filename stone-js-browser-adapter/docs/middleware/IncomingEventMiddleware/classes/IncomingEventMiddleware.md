# Class: IncomingEventMiddleware

Middleware for handling incoming events and transforming them into Stone.js events.

This class processes incoming HTTP requests, extracting relevant data such as URL, IP addresses,
headers, cookies, and more, and forwards them to the next middleware in the pipeline.

## Constructors

### Constructor

```ts
new IncomingEventMiddleware(options): IncomingEventMiddleware;
```

Create an IncomingEventMiddleware instance.

#### Parameters

##### options

Options containing the blueprint for resolving configuration and dependencies.

###### blueprint

`IBlueprint`

#### Returns

`IncomingEventMiddleware`

## Methods

### handle()

```ts
handle(context, next): Promise<BrowserAdapterResponseBuilder>;
```

Handles the incoming event, processes it, and invokes the next middleware in the pipeline.

#### Parameters

##### context

[`BrowserAdapterContext`](../../../declarations/type-aliases/BrowserAdapterContext.md)

The adapter context containing the raw event, execution context, and other data.

##### next

`NextMiddleware`\<[`BrowserAdapterContext`](../../../declarations/type-aliases/BrowserAdapterContext.md), [`BrowserAdapterResponseBuilder`](../../../declarations/type-aliases/BrowserAdapterResponseBuilder.md)\>

The next middleware to be invoked in the pipeline.

#### Returns

`Promise`\<[`BrowserAdapterResponseBuilder`](../../../declarations/type-aliases/BrowserAdapterResponseBuilder.md)\>

A promise that resolves to the processed context.

#### Throws

If required components are missing in the context.
