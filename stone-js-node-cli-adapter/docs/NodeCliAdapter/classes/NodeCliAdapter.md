# Class: NodeCliAdapter

Node Cli Adapter for Stone.js.

The `NodeCliAdapter` provides seamless integration between Stone.js applications
and the Node Cli environment. It processes incoming events from Node Cli,
transforms them into `IncomingEvent` instances, and returns a `RawResponse`.

This adapter ensures compatibility with Node Cli's execution model and
abstracts the event handling process for Stone.js developers.

## Template

**NodeCliEvent**

The type of the raw event received from Node Cli.

## Template

**RawResponse**

The type of the response to send back to Node Cli.

## Template

**NodeCliExecutionContext**

The Node Cli execution context type.

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

**NodeCliAdapterContext**

Context type specific to the adapter.

## Example

```typescript
import { NodeCliAdapter } from '@stone-js/node-cli-adapter';

const adapter = NodeCliAdapter.create({...});

const handler = await adapter.run();

export { handler };
```

## See

[Stone.js Documentation](https://stone-js.com/docs)

## Extends

- `Adapter`\<[`NodeCliEvent`](../../declarations/interfaces/NodeCliEvent.md), [`RawResponse`](../../declarations/type-aliases/RawResponse.md), [`NodeCliExecutionContext`](../../declarations/type-aliases/NodeCliExecutionContext.md), `IncomingEvent`, `IncomingEventOptions`, `OutgoingResponse`, [`NodeCliAdapterContext`](../../declarations/interfaces/NodeCliAdapterContext.md)\>

## Constructors

### Constructor

```ts
protected new NodeCliAdapter(blueprint): NodeCliAdapter;
```

Create an Adapter.

#### Parameters

##### blueprint

`IBlueprint`

The blueprint to create the adapter.

#### Returns

`NodeCliAdapter`

#### Inherited from

```ts
Adapter<
NodeCliEvent,
RawResponse,
NodeCliExecutionContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse,
NodeCliAdapterContext
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
protected readonly hooks: AdapterHookType<NodeCliAdapterContext, number>;
```

#### Inherited from

```ts
Adapter.hooks
```

***

### middleware

```ts
protected readonly middleware: AdapterMixedPipeType<NodeCliAdapterContext, number>[];
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

### applyExitCode()

```ts
protected applyExitCode(response): void;
```

Apply the resolved response as the process exit code (POSIX-normalized).

#### Parameters

##### response

`number`

The raw response (an HTTP-ish status/exit code).

#### Returns

`void`

***

### buildRawResponse()

```ts
protected buildRawResponse(context, eventHandler?): Promise<number>;
```

Build the raw response.

#### Parameters

##### context

[`NodeCliAdapterContext`](../../declarations/interfaces/NodeCliAdapterContext.md)

The event context.

##### eventHandler?

`AdapterEventHandlerType`\<`IncomingEvent`, `OutgoingResponse`\>

The event handler to be run.

#### Returns

`Promise`\<`number`\>

The raw response wrapper.

#### Inherited from

```ts
Adapter.buildRawResponse
```

***

### eventListener()

```ts
protected eventListener(rawEvent, executionContext): Promise<number>;
```

Processes an incoming Node Cli event.

This method transforms the raw Node Cli event into a Stone.js `IncomingEvent`,
processes it through the pipeline, and generates a `RawResponse` to send back.

#### Parameters

##### rawEvent

[`NodeCliEvent`](../../declarations/interfaces/NodeCliEvent.md)

The raw Node Cli event to be processed.

##### executionContext

[`CommandBuilder`](../../declarations/type-aliases/CommandBuilder.md)

The Node Cli execution context for the event.

#### Returns

`Promise`\<`number`\>

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

[`NodeCliAdapterContext`](../../declarations/interfaces/NodeCliAdapterContext.md)

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
protected handleError(error, context): Promise<AdapterEventBuilderType<number>>;
```

Handle error.

#### Parameters

##### error

`Error`

The error to handle.

##### context

[`NodeCliAdapterContext`](../../declarations/interfaces/NodeCliAdapterContext.md)

The event context.

#### Returns

`Promise`\<`AdapterEventBuilderType`\<`number`\>\>

The raw response.

#### Inherited from

```ts
Adapter.handleError
```

***

### handleEvent()

```ts
protected handleEvent(context, eventHandler): Promise<IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<number>>>;
```

Handle the event.

#### Parameters

##### context

[`NodeCliAdapterContext`](../../declarations/interfaces/NodeCliAdapterContext.md)

The event context.

##### eventHandler

`AdapterEventHandlerType`\<`IncomingEvent`, `OutgoingResponse`\>

The event handler to be run.

#### Returns

`Promise`\<`IAdapterEventBuilder`\<`RawResponseOptions`, `IRawResponseWrapper`\<`number`\>\>\>

The raw response wrapper.

#### Inherited from

```ts
Adapter.handleEvent
```

***

### makePipelineOptions()

```ts
protected makePipelineOptions(): PipelineOptions<NodeCliAdapterContext, AdapterEventBuilderType<number>>;
```

Create pipeline options for the Adapter.

#### Returns

`PipelineOptions`\<[`NodeCliAdapterContext`](../../declarations/interfaces/NodeCliAdapterContext.md), `AdapterEventBuilderType`\<`number`\>\>

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

Ensures the adapter is running in an Node Cli environment. If not, it
throws an error to prevent misuse.

#### Returns

`Promise`\<`void`\>

#### Throws

If executed outside an Node Cli context (e.g., browser).

***

### resolveErrorHandler()

```ts
protected resolveErrorHandler(error): IAdapterErrorHandler<NodeCliEvent, number, CommandBuilder>;
```

Get the error handler for the given error.

#### Parameters

##### error

`Error`

The error to get the handler for.

#### Returns

`IAdapterErrorHandler`\<[`NodeCliEvent`](../../declarations/interfaces/NodeCliEvent.md), `number`, [`CommandBuilder`](../../declarations/type-aliases/CommandBuilder.md)\>

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

Executes the adapter and provides an Node Cli-compatible handler function.

The `run` method processes events, manages context, and returns the appropriate response.

#### Type Parameters

##### ExecutionResultType

`ExecutionResultType` = `number`

The type representing the Node Cli event handler function.

#### Returns

`Promise`\<`ExecutionResultType`\>

A promise resolving to the Node Cli handler function.

#### Throws

If used outside the Node Cli environment.

#### Overrides

```ts
Adapter.run
```

***

### sendEventThroughDestination()

```ts
protected sendEventThroughDestination(context, eventHandler): Promise<number>;
```

Send the raw event through the destination.

#### Parameters

##### context

[`NodeCliAdapterContext`](../../declarations/interfaces/NodeCliAdapterContext.md)

The event context.

##### eventHandler

`AdapterEventHandlerType`\<`IncomingEvent`, `OutgoingResponse`\>

The event handler to be run.

#### Returns

`Promise`\<`number`\>

Platform-specific response.

#### Throws

IntegrationError

#### Inherited from

```ts
Adapter.sendEventThroughDestination
```

***

### toPosixExitCode()

```ts
protected toPosixExitCode(code): number;
```

Normalize an internal response code to a POSIX exit code (0-255).

Success (0 or a 2xx status) → 0; a "command not found" marker → 127; anything else that is
not a finite in-range code → 1 (general failure). Codes already in the 0-255 range pass
through so a command can return a precise POSIX code.

#### Parameters

##### code

`number`

The raw response code.

#### Returns

`number`

The POSIX exit code.

***

### validateContextAndEventHandler()

```ts
protected validateContextAndEventHandler(context, eventHandler): void;
```

Validate the context and event handler.

#### Parameters

##### context

[`NodeCliAdapterContext`](../../declarations/interfaces/NodeCliAdapterContext.md)

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
static create(blueprint): NodeCliAdapter;
```

Creates an instance of the `NodeCliAdapter`.

#### Parameters

##### blueprint

`IBlueprint`

The application blueprint.

#### Returns

`NodeCliAdapter`

A new instance of `NodeCliAdapter`.

#### Example

```typescript
const adapter = NodeCliAdapter.create(blueprint);
await adapter.run();
```
