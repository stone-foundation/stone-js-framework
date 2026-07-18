# Class: AwsLambdaAdapter

AWS Lambda Adapter for Stone.js.

The `AwsLambdaAdapter` provides seamless integration between Stone.js applications
and the AWS Lambda environment. It processes incoming events from AWS Lambda,
transforms them into `IncomingEvent` instances, and returns a `RawResponse`.

This adapter ensures compatibility with AWS Lambda's execution model and
abstracts the event handling process for Stone.js developers.

## Template

**AwsLambdaEvent**

The type of the raw event received from AWS Lambda.

## Template

**RawResponse**

The type of the response to send back to AWS Lambda.

## Template

**AwsLambdaContext**

The AWS Lambda execution context type.

## Template

**IncomingEvent**

The type of the processed incoming event.

## Template

**IncomingEventOptions**

Options used to create an incoming event.

## Template

**OutgoingResponse**

The type of the outgoing response after processing.

## Template

**AwsLambdaAdapterContext**

Context type specific to the adapter.

## Example

```typescript
import { AwsLambdaAdapter } from '@stone-js/aws-lambda-adapter';

const adapter = AwsLambdaAdapter.create({...});

const handler = await adapter.run();

export { handler };
```

## See

 - [Stone.js Documentation](https://stone-js.com/docs)
 - [AWS Lambda Documentation](https://docs.aws.amazon.com/lambda/)

## Extends

- `Adapter`\<[`AwsLambdaEvent`](../../declarations/type-aliases/AwsLambdaEvent.md), [`RawResponse`](../../declarations/type-aliases/RawResponse.md), [`AwsLambdaContext`](../../declarations/type-aliases/AwsLambdaContext.md), `IncomingEvent`, `IncomingEventOptions`, `OutgoingResponse`, [`AwsLambdaAdapterContext`](../../declarations/interfaces/AwsLambdaAdapterContext.md)\>

## Constructors

### Constructor

```ts
protected new AwsLambdaAdapter(blueprint): AwsLambdaAdapter;
```

Create an Adapter.

#### Parameters

##### blueprint

`IBlueprint`

The blueprint to create the adapter.

#### Returns

`AwsLambdaAdapter`

#### Inherited from

```ts
Adapter<
AwsLambdaEvent,
RawResponse,
AwsLambdaContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse,
AwsLambdaAdapterContext
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
protected readonly hooks: AdapterHookType<AwsLambdaAdapterContext, RawResponse>;
```

#### Inherited from

```ts
Adapter.hooks
```

***

### middleware

```ts
protected readonly middleware: AdapterMixedPipeType<AwsLambdaAdapterContext, RawResponse>[];
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
protected buildRawResponse(context, eventHandler?): Promise<RawResponse>;
```

Build the raw response.

#### Parameters

##### context

[`AwsLambdaAdapterContext`](../../declarations/interfaces/AwsLambdaAdapterContext.md)

The event context.

##### eventHandler?

`AdapterEventHandlerType`\<`IncomingEvent`, `OutgoingResponse`\>

The event handler to be run.

#### Returns

`Promise`\<[`RawResponse`](../../declarations/type-aliases/RawResponse.md)\>

The raw response wrapper.

#### Inherited from

```ts
Adapter.buildRawResponse
```

***

### eventListener()

```ts
protected eventListener(rawEvent, executionContext): Promise<RawResponse>;
```

Processes an incoming AWS Lambda event.

This method transforms the raw AWS Lambda event into a Stone.js `IncomingEvent`,
processes it through the pipeline, and generates a `RawResponse` to send back.

#### Parameters

##### rawEvent

[`AwsLambdaEvent`](../../declarations/type-aliases/AwsLambdaEvent.md)

The raw AWS Lambda event to be processed.

##### executionContext

[`AwsLambdaContext`](../../declarations/type-aliases/AwsLambdaContext.md)

The AWS Lambda execution context for the event.

#### Returns

`Promise`\<[`RawResponse`](../../declarations/type-aliases/RawResponse.md)\>

A promise resolving to the processed `RawResponse`.

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

`AdapterEventHandlerType`\<`IncomingEvent`, `OutgoingResponse`\>

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

[`AwsLambdaAdapterContext`](../../declarations/interfaces/AwsLambdaAdapterContext.md)

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
protected handleError(error, context): Promise<AdapterEventBuilderType<RawResponse>>;
```

Handle error.

#### Parameters

##### error

`Error`

The error to handle.

##### context

[`AwsLambdaAdapterContext`](../../declarations/interfaces/AwsLambdaAdapterContext.md)

The event context.

#### Returns

`Promise`\<`AdapterEventBuilderType`\<[`RawResponse`](../../declarations/type-aliases/RawResponse.md)\>\>

The raw response.

#### Inherited from

```ts
Adapter.handleError
```

***

### handleEvent()

```ts
protected handleEvent(context, eventHandler): Promise<IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<RawResponse>>>;
```

Handle the event.

#### Parameters

##### context

[`AwsLambdaAdapterContext`](../../declarations/interfaces/AwsLambdaAdapterContext.md)

The event context.

##### eventHandler

`AdapterEventHandlerType`\<`IncomingEvent`, `OutgoingResponse`\>

The event handler to be run.

#### Returns

`Promise`\<`IAdapterEventBuilder`\<`RawResponseOptions`, `IRawResponseWrapper`\<[`RawResponse`](../../declarations/type-aliases/RawResponse.md)\>\>\>

The raw response wrapper.

#### Inherited from

```ts
Adapter.handleEvent
```

***

### makePipelineOptions()

```ts
protected makePipelineOptions(): PipelineOptions<AwsLambdaAdapterContext, AdapterEventBuilderType<RawResponse>>;
```

Create pipeline options for the Adapter.

#### Returns

`PipelineOptions`\<[`AwsLambdaAdapterContext`](../../declarations/interfaces/AwsLambdaAdapterContext.md), `AdapterEventBuilderType`\<[`RawResponse`](../../declarations/type-aliases/RawResponse.md)\>\>

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

Ensures the adapter is running in an AWS Lambda environment. If not, it
throws an error to prevent misuse.

#### Returns

`Promise`\<`void`\>

#### Throws

If executed outside an AWS Lambda context (e.g., browser).

***

### resolveErrorHandler()

```ts
protected resolveErrorHandler(error): IAdapterErrorHandler<AwsLambdaEvent, RawResponse, AwsLambdaContext>;
```

Get the error handler for the given error.

#### Parameters

##### error

`Error`

The error to get the handler for.

#### Returns

`IAdapterErrorHandler`\<[`AwsLambdaEvent`](../../declarations/type-aliases/AwsLambdaEvent.md), [`RawResponse`](../../declarations/type-aliases/RawResponse.md), [`AwsLambdaContext`](../../declarations/type-aliases/AwsLambdaContext.md)\>

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
protected resolveEventHandler(): AdapterEventHandlerType<IncomingEvent, OutgoingResponse>;
```

Get the event handler for the adapter.

#### Returns

`AdapterEventHandlerType`\<`IncomingEvent`, `OutgoingResponse`\>

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

Executes the adapter and provides an AWS Lambda-compatible handler function.

The `run` method initializes the adapter and returns a handler function
that AWS Lambda can invoke. This handler processes events, manages context,
and returns the appropriate response.

#### Type Parameters

##### ExecutionResultType

`ExecutionResultType` = [`AwsLambdaEventHandlerFunction`](../../declarations/type-aliases/AwsLambdaEventHandlerFunction.md)

The type representing the AWS Lambda event handler function.

#### Returns

`Promise`\<`ExecutionResultType`\>

A promise resolving to the AWS Lambda handler function.

#### Throws

If used outside the AWS Lambda environment.

#### Overrides

```ts
Adapter.run
```

***

### sendEventThroughDestination()

```ts
protected sendEventThroughDestination(context, eventHandler): Promise<RawResponse>;
```

Send the raw event through the destination.

#### Parameters

##### context

[`AwsLambdaAdapterContext`](../../declarations/interfaces/AwsLambdaAdapterContext.md)

The event context.

##### eventHandler

`AdapterEventHandlerType`\<`IncomingEvent`, `OutgoingResponse`\>

The event handler to be run.

#### Returns

`Promise`\<[`RawResponse`](../../declarations/type-aliases/RawResponse.md)\>

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

[`AwsLambdaAdapterContext`](../../declarations/interfaces/AwsLambdaAdapterContext.md)

The context to validate.

##### eventHandler

`AdapterEventHandlerType`\<`IncomingEvent`, `OutgoingResponse`\>

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
static create(blueprint): AwsLambdaAdapter;
```

Creates an instance of the `AwsLambdaAdapter`.

#### Parameters

##### blueprint

`IBlueprint`

The application blueprint.

#### Returns

`AwsLambdaAdapter`

A new instance of `AwsLambdaAdapter`.

#### Example

```typescript
const adapter = AwsLambdaAdapter.create(blueprint);
await adapter.run();
```
