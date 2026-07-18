# Class: AwsLambdaHttpAdapter

AWS Lambda HTTP Adapter for Stone.js.

The `AwsLambdaHttpAdapter` extends the functionality of the Stone.js `Adapter`
to provide seamless integration with AWS Lambda for HTTP-based events. This adapter
transforms incoming HTTP events from AWS Lambda into `IncomingHttpEvent` instances
and produces a `RawHttpResponse` as output.

This adapter simplifies the process of handling HTTP events within AWS Lambda
while adhering to the Stone.js framework's event-driven architecture.

## Template

**AwsLambdaHttpEvent**

The type of the raw HTTP event from AWS Lambda.

## Template

**RawHttpResponse**

The type of the raw HTTP response to send back.

## Template

**AwsLambdaContext**

The AWS Lambda execution context type.

## Template

**IncomingHttpEvent**

The type of the processed incoming HTTP event.

## Template

**IncomingHttpEventOptions**

Options used to create an incoming HTTP event.

## Template

**OutgoingHttpResponse**

The type of the outgoing HTTP response after processing.

## Template

**AwsLambdaHttpAdapterContext**

Context type specific to the HTTP adapter.

## Example

```typescript
import { AwsLambdaHttpAdapter } from '@stone-js/aws-lambda-http-adapter';

const adapter = AwsLambdaHttpAdapter.create({...});

const handler = await adapter.run();

export { handler };
```

## See

 - [Stone.js Documentation](https://stone-js.com/docs)
 - [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/latest/dg/)

## Extends

- `Adapter`\<[`AwsLambdaHttpEvent`](../../declarations/interfaces/AwsLambdaHttpEvent.md), [`RawHttpResponse`](../../declarations/type-aliases/RawHttpResponse.md), [`AwsLambdaContext`](../../declarations/type-aliases/AwsLambdaContext.md), `IncomingHttpEvent`, `IncomingHttpEventOptions`, `OutgoingHttpResponse`, [`AwsLambdaHttpAdapterContext`](../../declarations/interfaces/AwsLambdaHttpAdapterContext.md)\>

## Constructors

### Constructor

```ts
protected new AwsLambdaHttpAdapter(blueprint): AwsLambdaHttpAdapter;
```

Create an Adapter.

#### Parameters

##### blueprint

`IBlueprint`

The blueprint to create the adapter.

#### Returns

`AwsLambdaHttpAdapter`

#### Inherited from

```ts
Adapter<
AwsLambdaHttpEvent,
RawHttpResponse,
AwsLambdaContext,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse,
AwsLambdaHttpAdapterContext
>.constructor
```

## Properties

### blueprint

```ts
protected readonly blueprint: IBlueprint;
```

#### Inherited from

```ts
Adapter.blueprint
```

***

### hooks

```ts
protected readonly hooks: AdapterHookType<AwsLambdaHttpAdapterContext, RawHttpResponseOptions>;
```

#### Inherited from

```ts
Adapter.hooks
```

***

### middleware

```ts
protected readonly middleware: AdapterMixedPipeType<AwsLambdaHttpAdapterContext, RawHttpResponseOptions>[];
```

#### Inherited from

```ts
Adapter.middleware
```

***

### resolvedErrorHandlers

```ts
protected readonly resolvedErrorHandlers: Record<string, IAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>>;
```

#### Inherited from

```ts
Adapter.resolvedErrorHandlers
```

## Methods

### buildRawResponse()

```ts
protected buildRawResponse(context, eventHandler?): Promise<RawHttpResponseOptions>;
```

Build the raw response.

#### Parameters

##### context

[`AwsLambdaHttpAdapterContext`](../../declarations/interfaces/AwsLambdaHttpAdapterContext.md)

The event context.

##### eventHandler?

`AdapterEventHandlerType`\<`IncomingHttpEvent`, `OutgoingHttpResponse`\>

The event handler to be run.

#### Returns

`Promise`\<[`RawHttpResponseOptions`](../../declarations/interfaces/RawHttpResponseOptions.md)\>

The raw response wrapper.

#### Inherited from

```ts
Adapter.buildRawResponse
```

***

### eventListener()

```ts
protected eventListener(rawEvent, executionContext): Promise<RawHttpResponseOptions>;
```

Processes an incoming AWS Lambda HTTP event.

Converts a raw AWS Lambda HTTP event into an `IncomingHttpEvent`, processes it through
the Stone.js pipeline, and generates a `RawHttpResponse` to send back.

#### Parameters

##### rawEvent

[`AwsLambdaHttpEvent`](../../declarations/interfaces/AwsLambdaHttpEvent.md)

The raw HTTP event received from AWS Lambda.

##### executionContext

[`AwsLambdaContext`](../../declarations/type-aliases/AwsLambdaContext.md)

The AWS Lambda execution context associated with the event.

#### Returns

`Promise`\<[`RawHttpResponseOptions`](../../declarations/interfaces/RawHttpResponseOptions.md)\>

A promise resolving to the processed `RawHttpResponse`.

***

### executeEventHandlerHooks()

```ts
protected executeEventHandlerHooks(hook, eventHandler): Promise<void>;
```

Execute the event handler lifecycle hooks.

#### Parameters

##### hook

`KernelHookName`

The hook to execute.

##### eventHandler

`AdapterEventHandlerType`\<`IncomingHttpEvent`, `OutgoingHttpResponse`\>

The event handler to be run.

#### Returns

`Promise`\<`void`\>

#### Inherited from

```ts
Adapter.executeEventHandlerHooks
```

***

### executeHooks()

```ts
protected executeHooks(
   name, 
   context?, 
error?): Promise<void>;
```

Execute adapter lifecycle hooks.

#### Parameters

##### name

`AdapterHookName`

The hook's name.

##### context?

[`AwsLambdaHttpAdapterContext`](../../declarations/interfaces/AwsLambdaHttpAdapterContext.md)

The event context.

##### error?

`any`

The error to handle.

#### Returns

`Promise`\<`void`\>

#### Inherited from

```ts
Adapter.executeHooks
```

***

### handleError()

```ts
protected handleError(error, context): Promise<AdapterEventBuilderType<RawHttpResponseOptions>>;
```

Handle error.

#### Parameters

##### error

`Error`

The error to handle.

##### context

[`AwsLambdaHttpAdapterContext`](../../declarations/interfaces/AwsLambdaHttpAdapterContext.md)

The event context.

#### Returns

`Promise`\<`AdapterEventBuilderType`\<[`RawHttpResponseOptions`](../../declarations/interfaces/RawHttpResponseOptions.md)\>\>

The raw response.

#### Inherited from

```ts
Adapter.handleError
```

***

### handleEvent()

```ts
protected handleEvent(context, eventHandler): Promise<IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<RawHttpResponseOptions>>>;
```

Handle the event.

#### Parameters

##### context

[`AwsLambdaHttpAdapterContext`](../../declarations/interfaces/AwsLambdaHttpAdapterContext.md)

The event context.

##### eventHandler

`AdapterEventHandlerType`\<`IncomingHttpEvent`, `OutgoingHttpResponse`\>

The event handler to be run.

#### Returns

`Promise`\<`IAdapterEventBuilder`\<`RawResponseOptions`, `IRawResponseWrapper`\<[`RawHttpResponseOptions`](../../declarations/interfaces/RawHttpResponseOptions.md)\>\>\>

The raw response wrapper.

#### Inherited from

```ts
Adapter.handleEvent
```

***

### makePipelineOptions()

```ts
protected makePipelineOptions(): PipelineOptions<AwsLambdaHttpAdapterContext, AdapterEventBuilderType<RawHttpResponseOptions>>;
```

Create pipeline options for the Adapter.

#### Returns

`PipelineOptions`\<[`AwsLambdaHttpAdapterContext`](../../declarations/interfaces/AwsLambdaHttpAdapterContext.md), `AdapterEventBuilderType`\<[`RawHttpResponseOptions`](../../declarations/interfaces/RawHttpResponseOptions.md)\>\>

The pipeline options for transforming the event.

#### Inherited from

```ts
Adapter.makePipelineOptions
```

***

### onStart()

```ts
protected onStart(): Promise<void>;
```

Initializes the adapter and validates its execution context.

Ensures that the adapter is running in an AWS Lambda environment. Throws an error
if it detects that the adapter is being used in an unsupported environment (e.g., a browser).

#### Returns

`Promise`\<`void`\>

#### Throws

If executed outside an AWS Lambda environment.

***

### resolveErrorHandler()

```ts
protected resolveErrorHandler(error): IAdapterErrorHandler<AwsLambdaHttpEvent, RawHttpResponseOptions, AwsLambdaContext>;
```

Get the error handler for the given error.

#### Parameters

##### error

`Error`

The error to get the handler for.

#### Returns

`IAdapterErrorHandler`\<[`AwsLambdaHttpEvent`](../../declarations/interfaces/AwsLambdaHttpEvent.md), [`RawHttpResponseOptions`](../../declarations/interfaces/RawHttpResponseOptions.md), [`AwsLambdaContext`](../../declarations/type-aliases/AwsLambdaContext.md)\>

The error handler.

#### Throws

IntegrationError

#### Inherited from

```ts
Adapter.resolveErrorHandler
```

***

### resolveEventHandler()

```ts
protected resolveEventHandler(): AdapterEventHandlerType<IncomingHttpEvent, OutgoingHttpResponse>;
```

Get the event handler for the adapter.

#### Returns

`AdapterEventHandlerType`\<`IncomingHttpEvent`, `OutgoingHttpResponse`\>

The event handler for the adapter.

#### Throws

If the event handler is missing.

#### Inherited from

```ts
Adapter.resolveEventHandler
```

***

### run()

```ts
run<ExecutionResultType>(): Promise<ExecutionResultType>;
```

Executes the adapter and provides an AWS Lambda-compatible HTTP handler function.

This method initializes the adapter and returns a handler function that can
process HTTP events in AWS Lambda. It transforms raw events into `IncomingHttpEvent`
instances and produces `RawHttpResponse` objects as output.

#### Type Parameters

##### ExecutionResultType

`ExecutionResultType` = [`AwsLambdaEventHandlerFunction`](../../declarations/type-aliases/AwsLambdaEventHandlerFunction.md)\<[`RawHttpResponseOptions`](../../declarations/interfaces/RawHttpResponseOptions.md)\>

The type representing the AWS Lambda event handler function.

#### Returns

`Promise`\<`ExecutionResultType`\>

A promise resolving to the AWS Lambda HTTP handler function.

#### Throws

If used outside the AWS Lambda environment.

#### Overrides

```ts
Adapter.run
```

***

### sendEventThroughDestination()

```ts
protected sendEventThroughDestination(context, eventHandler): Promise<RawHttpResponseOptions>;
```

Send the raw event through the destination.

#### Parameters

##### context

[`AwsLambdaHttpAdapterContext`](../../declarations/interfaces/AwsLambdaHttpAdapterContext.md)

The event context.

##### eventHandler

`AdapterEventHandlerType`\<`IncomingHttpEvent`, `OutgoingHttpResponse`\>

The event handler to be run.

#### Returns

`Promise`\<[`RawHttpResponseOptions`](../../declarations/interfaces/RawHttpResponseOptions.md)\>

Platform-specific response.

#### Throws

IntegrationError

#### Inherited from

```ts
Adapter.sendEventThroughDestination
```

***

### validateContextAndEventHandler()

```ts
protected validateContextAndEventHandler(context, eventHandler): void;
```

Validate the context and event handler.

#### Parameters

##### context

[`AwsLambdaHttpAdapterContext`](../../declarations/interfaces/AwsLambdaHttpAdapterContext.md)

The context to validate.

##### eventHandler

`AdapterEventHandlerType`\<`IncomingHttpEvent`, `OutgoingHttpResponse`\>

The event handler to validate.

#### Returns

`void`

#### Throws

IntegrationError

#### Inherited from

```ts
Adapter.validateContextAndEventHandler
```

***

### create()

```ts
static create(blueprint): AwsLambdaHttpAdapter;
```

Creates an instance of the `AwsLambdaHttpAdapter`.

#### Parameters

##### blueprint

`IBlueprint`

The application blueprint.

#### Returns

`AwsLambdaHttpAdapter`

A new instance of `AwsLambdaHttpAdapter`.

#### Example

```typescript
const adapter = AwsLambdaHttpAdapter.create(blueprint);
await adapter.run();
```
