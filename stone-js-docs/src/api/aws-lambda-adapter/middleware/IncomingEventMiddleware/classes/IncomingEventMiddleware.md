# Class: IncomingEventMiddleware

Middleware for handling incoming events and transforming them into Stone.js events.

This class processes incoming events, extracting relevant data and forwards them to the next middleware in the pipeline.

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
handle(context, next): Promise<AwsLambdaAdapterResponseBuilder>;
```

Handles the incoming event, processes it, and invokes the next middleware in the pipeline.

#### Parameters

##### context

[`AwsLambdaAdapterContext`](../../../declarations/interfaces/AwsLambdaAdapterContext.md)

The adapter context containing the raw event, execution context, and other data.

##### next

`NextMiddleware`\<[`AwsLambdaAdapterContext`](../../../declarations/interfaces/AwsLambdaAdapterContext.md), [`AwsLambdaAdapterResponseBuilder`](../../../declarations/type-aliases/AwsLambdaAdapterResponseBuilder.md)\>

The next middleware to be invoked in the pipeline.

#### Returns

`Promise`\<[`AwsLambdaAdapterResponseBuilder`](../../../declarations/type-aliases/AwsLambdaAdapterResponseBuilder.md)\>

A promise that resolves to the processed Response Builder.

#### Throws

If required components are missing in the context.
