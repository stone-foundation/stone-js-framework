# Class: BrowserAdapter

Browser Adapter for Stone.js.

The `BrowserAdapter` provides seamless integration between Stone.js applications
and the Browser environment. It processes incoming events from Browser,
transforms them into `IncomingBrowserEvent` instances, and returns a `BrowserResponse`.

This adapter ensures compatibility with Browser's execution model and
abstracts the event handling process for Stone.js developers.

## Template

**BrowserEvent**

The type of the raw event received from Browser.

## Template

**BrowserResponse**

The type of the response to send back to Browser.

## Template

**BrowserContext**

The Browser execution context type.

## Template

**IncomingBrowserEvent**

The type of the processed incoming event.

## Template

**IncomingBrowserEventOptions**

Options used to create an incoming event.

## Template

**OutgoingBrowserResponse**

The type of the outgoing response after processing.

## Template

**BrowserAdapterContext**

Context type specific to the adapter.

## Example

```typescript
import { BrowserAdapter } from '@stone-js/browser-adapter';

const adapter = BrowserAdapter.create({...});

await adapter.run();
```

## See

[Stone.js Documentation](https://stone-js.com/docs)

## Extends

- `Adapter`\<[`BrowserEvent`](../../declarations/type-aliases/BrowserEvent.md), [`BrowserResponse`](../../declarations/type-aliases/BrowserResponse.md), [`BrowserContext`](../../declarations/type-aliases/BrowserContext.md), `IncomingBrowserEvent`, `IncomingBrowserEventOptions`, `OutgoingBrowserResponse`, [`BrowserAdapterContext`](../../declarations/type-aliases/BrowserAdapterContext.md)\>

## Constructors

### Constructor

```ts
protected new BrowserAdapter(blueprint): BrowserAdapter;
```

Create an Adapter.

#### Parameters

##### blueprint

`IBlueprint`

The blueprint to create the adapter.

#### Returns

`BrowserAdapter`

#### Inherited from

```ts
Adapter<
BrowserEvent,
BrowserResponse,
BrowserContext,
IncomingBrowserEvent,
IncomingBrowserEventOptions,
OutgoingBrowserResponse,
BrowserAdapterContext
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
protected readonly hooks: AdapterHookType<BrowserAdapterContext, unknown>;
```

#### Inherited from

```ts
Adapter.hooks
```

***

### middleware

```ts
protected readonly middleware: AdapterMixedPipeType<BrowserAdapterContext, unknown>[];
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
protected buildRawResponse(context, eventHandler?): Promise<unknown>;
```

Build the raw response.

#### Parameters

##### context

[`BrowserAdapterContext`](../../declarations/type-aliases/BrowserAdapterContext.md)

The event context.

##### eventHandler?

`AdapterEventHandlerType`\<`IncomingBrowserEvent`, `OutgoingBrowserResponse`\>

The event handler to be run.

#### Returns

`Promise`\<`unknown`\>

The raw response wrapper.

#### Inherited from

```ts
Adapter.buildRawResponse
```

***

### eventListener()

```ts
protected eventListener(
   eventHandler, 
   rawEvent, 
executionContext): Promise<unknown>;
```

Processes an incoming Browser event.

This method transforms the raw Browser event into a Stone.js `IncomingBrowserEvent`,
processes it through the pipeline, and generates a `RawResponse` to send back.

#### Parameters

##### eventHandler

`AdapterEventHandlerType`\<`IncomingBrowserEvent`, `OutgoingBrowserResponse`\>

##### rawEvent

[`BrowserEvent`](../../declarations/type-aliases/BrowserEvent.md)

The raw Browser event to be processed.

##### executionContext

`Window` & *typeof* `globalThis`

The Browser execution context for the event.

#### Returns

`Promise`\<`unknown`\>

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

`AdapterEventHandlerType`\<`IncomingBrowserEvent`, `OutgoingBrowserResponse`\>

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

[`BrowserAdapterContext`](../../declarations/type-aliases/BrowserAdapterContext.md)

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
protected handleError(error, context): Promise<AdapterEventBuilderType<unknown>>;
```

Handle error.

#### Parameters

##### error

`Error`

The error to handle.

##### context

[`BrowserAdapterContext`](../../declarations/type-aliases/BrowserAdapterContext.md)

The event context.

#### Returns

`Promise`\<`AdapterEventBuilderType`\<`unknown`\>\>

The raw response.

#### Inherited from

```ts
Adapter.handleError
```

***

### handleEvent()

```ts
protected handleEvent(context, eventHandler): Promise<IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<unknown>>>;
```

Handle the event.

#### Parameters

##### context

[`BrowserAdapterContext`](../../declarations/type-aliases/BrowserAdapterContext.md)

The event context.

##### eventHandler

`AdapterEventHandlerType`\<`IncomingBrowserEvent`, `OutgoingBrowserResponse`\>

The event handler to be run.

#### Returns

`Promise`\<`IAdapterEventBuilder`\<`RawResponseOptions`, `IRawResponseWrapper`\<`unknown`\>\>\>

The raw response wrapper.

#### Inherited from

```ts
Adapter.handleEvent
```

***

### makePipelineOptions()

```ts
protected makePipelineOptions(): PipelineOptions<BrowserAdapterContext, AdapterEventBuilderType<unknown>>;
```

Create pipeline options for the Adapter.

#### Returns

`PipelineOptions`\<[`BrowserAdapterContext`](../../declarations/type-aliases/BrowserAdapterContext.md), `AdapterEventBuilderType`\<`unknown`\>\>

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

Ensures the adapter is running in a Browser environment. If not, it
throws an error to prevent misuse.

#### Returns

`Promise`\<`void`\>

#### Throws

If executed outside a Browser context (e.g., node).

***

### resolveErrorHandler()

```ts
protected resolveErrorHandler(error): IAdapterErrorHandler<BrowserEvent, unknown, Window & typeof globalThis>;
```

Get the error handler for the given error.

#### Parameters

##### error

`Error`

The error to get the handler for.

#### Returns

`IAdapterErrorHandler`\<[`BrowserEvent`](../../declarations/type-aliases/BrowserEvent.md), `unknown`, `Window` & *typeof* `globalThis`\>

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
protected resolveEventHandler(): AdapterEventHandlerType<IncomingBrowserEvent, OutgoingBrowserResponse>;
```

Get the event handler for the adapter.

#### Returns

`AdapterEventHandlerType`\<`IncomingBrowserEvent`, `OutgoingBrowserResponse`\>

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

Executes the adapter and provides an Browser-compatible handler function.

The `run` method initializes the adapter and listens for incoming Browser events.
It processes these events, generates a response, and sends it back to the Browser.

Idempotent: calling `run()` again tears down the previous listeners first, so HMR
reloads and tests never accumulate duplicate handlers.

#### Type Parameters

##### ExecutionResultType

`ExecutionResultType` = `undefined`

#### Returns

`Promise`\<`ExecutionResultType`\>

#### Throws

If used outside the Browser environment.

#### Overrides

```ts
Adapter.run
```

***

### sendEventThroughDestination()

```ts
protected sendEventThroughDestination(context, eventHandler): Promise<unknown>;
```

Send the raw event through the destination.

#### Parameters

##### context

[`BrowserAdapterContext`](../../declarations/type-aliases/BrowserAdapterContext.md)

The event context.

##### eventHandler

`AdapterEventHandlerType`\<`IncomingBrowserEvent`, `OutgoingBrowserResponse`\>

The event handler to be run.

#### Returns

`Promise`\<`unknown`\>

Platform-specific response.

#### Throws

IntegrationError

#### Inherited from

```ts
Adapter.sendEventThroughDestination
```

***

### stop()

```ts
stop(): Promise<void>;
```

Tear down the adapter: remove all registered `window` listeners and run `onStop` hooks.

Safe to call multiple times and when the adapter was never started.

#### Returns

`Promise`\<`void`\>

***

### validateContextAndEventHandler()

```ts
protected validateContextAndEventHandler(context, eventHandler): void;
```

Validate the context and event handler.

#### Parameters

##### context

[`BrowserAdapterContext`](../../declarations/type-aliases/BrowserAdapterContext.md)

The context to validate.

##### eventHandler

`AdapterEventHandlerType`\<`IncomingBrowserEvent`, `OutgoingBrowserResponse`\>

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
static create(blueprint): BrowserAdapter;
```

#### Parameters

##### blueprint

`IBlueprint`

#### Returns

`BrowserAdapter`
