# Class: IncomingEventMiddleware

Middleware for handling incoming events and transforming them into Stone.js events.

It first normalizes the raw AWS event (API Gateway v1/v2, ALB, Function URLs) into a single
canonical shape, then extracts URL, IP addresses, headers, cookies, query and the raw body,
so the pipeline never has to reason about which trigger fired. The untouched request body is
always exposed as `metadata.rawBody` — even when no body-parsing middleware is installed — so
consumers can read the original payload (e.g. to verify a webhook signature).

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
handle(context, next): Promise<AwsLambdaHttpAdapterResponseBuilder>;
```

Handles the incoming event, processes it, and invokes the next middleware in the pipeline.

#### Parameters

##### context

[`AwsLambdaHttpAdapterContext`](../../../declarations/interfaces/AwsLambdaHttpAdapterContext.md)

The adapter context containing the raw event, execution context, and other data.

##### next

`NextMiddleware`\<[`AwsLambdaHttpAdapterContext`](../../../declarations/interfaces/AwsLambdaHttpAdapterContext.md), [`AwsLambdaHttpAdapterResponseBuilder`](../../../declarations/type-aliases/AwsLambdaHttpAdapterResponseBuilder.md)\>

The next middleware to be invoked in the pipeline.

#### Returns

`Promise`\<[`AwsLambdaHttpAdapterResponseBuilder`](../../../declarations/type-aliases/AwsLambdaHttpAdapterResponseBuilder.md)\>

A promise that resolves to the processed context.

#### Throws

If required components are missing in the context.
