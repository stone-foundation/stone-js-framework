# Class: `abstract` Adapter\<RawEventType, RawResponseType, ExecutionContextType, IncomingEventType, IncomingEventOptionsType, OutgoingResponseType, AdapterContextType\>

Class representing an Adapter.

## Author

Mr. Stone <evensstone@gmail.com>

## Type Parameters

### RawEventType

`RawEventType`

### RawResponseType

`RawResponseType`

### ExecutionContextType

`ExecutionContextType`

### IncomingEventType

`IncomingEventType` *extends* [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md)

### IncomingEventOptionsType

`IncomingEventOptionsType` *extends* [`IncomingEventOptions`](../../../events/IncomingEvent/interfaces/IncomingEventOptions.md)

### OutgoingResponseType

`OutgoingResponseType` *extends* [`OutgoingResponse`](../../../events/OutgoingResponse/classes/OutgoingResponse.md)

### AdapterContextType

`AdapterContextType` *extends* [`AdapterContext`](../../../declarations/interfaces/AdapterContext.md)\<`RawEventType`, `RawResponseType`, `ExecutionContextType`, `IncomingEventType`, `IncomingEventOptionsType`, `OutgoingResponseType`\> = [`AdapterContext`](../../../declarations/interfaces/AdapterContext.md)\<`RawEventType`, `RawResponseType`, `ExecutionContextType`, `IncomingEventType`, `IncomingEventOptionsType`, `OutgoingResponseType`\>

## Implements

- [`IAdapter`](../../../declarations/interfaces/IAdapter.md)

## Constructors

### Constructor

```ts
protected new Adapter<RawEventType, RawResponseType, ExecutionContextType, IncomingEventType, IncomingEventOptionsType, OutgoingResponseType, AdapterContextType>(blueprint): Adapter<RawEventType, RawResponseType, ExecutionContextType, IncomingEventType, IncomingEventOptionsType, OutgoingResponseType, AdapterContextType>;
```

Create an Adapter.

#### Parameters

##### blueprint

[`IBlueprint`](../../../declarations/type-aliases/IBlueprint.md)

The blueprint to create the adapter.

#### Returns

`Adapter`\<`RawEventType`, `RawResponseType`, `ExecutionContextType`, `IncomingEventType`, `IncomingEventOptionsType`, `OutgoingResponseType`, `AdapterContextType`\>

## Properties

### blueprint

```ts
protected readonly blueprint: IBlueprint;
```

The blueprint to create the adapter.

***

### hooks

```ts
protected readonly hooks: AdapterHookType<AdapterContextType, RawResponseType>;
```

***

### middleware

```ts
protected readonly middleware: AdapterMixedPipeType<AdapterContextType, RawResponseType>[];
```

***

### resolvedErrorHandlers

```ts
protected readonly resolvedErrorHandlers: Record<string, IAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>>;
```

## Methods

### buildRawResponse()

```ts
protected buildRawResponse(context, eventHandler?): Promise<RawResponseType>;
```

Build the raw response.

#### Parameters

##### context

`AdapterContextType`

The event context.

##### eventHandler?

[`AdapterEventHandlerType`](../../../declarations/type-aliases/AdapterEventHandlerType.md)\<`IncomingEventType`, `OutgoingResponseType`\>

The event handler to be run.

#### Returns

`Promise`\<`RawResponseType`\>

The raw response wrapper.

***

### executeEventHandlerHooks()

```ts
protected executeEventHandlerHooks(hook, eventHandler): Promise<void>;
```

Execute the event handler lifecycle hooks.

#### Parameters

##### hook

[`KernelHookName`](../../../declarations/type-aliases/KernelHookName.md)

The hook to execute.

##### eventHandler

[`AdapterEventHandlerType`](../../../declarations/type-aliases/AdapterEventHandlerType.md)\<`IncomingEventType`, `OutgoingResponseType`\>

The event handler to be run.

#### Returns

`Promise`\<`void`\>

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

[`AdapterHookName`](../../../declarations/type-aliases/AdapterHookName.md)

The hook's name.

##### context?

`AdapterContextType`

The event context.

##### error?

`any`

The error to handle.

#### Returns

`Promise`\<`void`\>

***

### handleError()

```ts
protected handleError(error, context): Promise<IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<RawResponseType>>>;
```

Handle error.

#### Parameters

##### error

`Error`

The error to handle.

##### context

`AdapterContextType`

The event context.

#### Returns

`Promise`\<[`IAdapterEventBuilder`](../../../declarations/interfaces/IAdapterEventBuilder.md)\<[`RawResponseOptions`](../../../declarations/interfaces/RawResponseOptions.md), [`IRawResponseWrapper`](../../../declarations/interfaces/IRawResponseWrapper.md)\<`RawResponseType`\>\>\>

The raw response.

***

### handleEvent()

```ts
protected handleEvent(context, eventHandler): Promise<IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<RawResponseType>>>;
```

Handle the event.

#### Parameters

##### context

`AdapterContextType`

The event context.

##### eventHandler

[`AdapterEventHandlerType`](../../../declarations/type-aliases/AdapterEventHandlerType.md)\<`IncomingEventType`, `OutgoingResponseType`\>

The event handler to be run.

#### Returns

`Promise`\<[`IAdapterEventBuilder`](../../../declarations/interfaces/IAdapterEventBuilder.md)\<[`RawResponseOptions`](../../../declarations/interfaces/RawResponseOptions.md), [`IRawResponseWrapper`](../../../declarations/interfaces/IRawResponseWrapper.md)\<`RawResponseType`\>\>\>

The raw response wrapper.

***

### makePipelineOptions()

```ts
protected makePipelineOptions(): PipelineOptions<AdapterContextType, IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<RawResponseType>>>;
```

Create pipeline options for the Adapter.

#### Returns

`PipelineOptions`\<`AdapterContextType`, [`IAdapterEventBuilder`](../../../declarations/interfaces/IAdapterEventBuilder.md)\<[`RawResponseOptions`](../../../declarations/interfaces/RawResponseOptions.md), [`IRawResponseWrapper`](../../../declarations/interfaces/IRawResponseWrapper.md)\<`RawResponseType`\>\>\>

The pipeline options for transforming the event.

***

### resolveErrorHandler()

```ts
protected resolveErrorHandler(error): IAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>;
```

Get the error handler for the given error.

#### Parameters

##### error

`Error`

The error to get the handler for.

#### Returns

[`IAdapterErrorHandler`](../../../declarations/interfaces/IAdapterErrorHandler.md)\<`RawEventType`, `RawResponseType`, `ExecutionContextType`\>

The error handler.

#### Throws

IntegrationError

***

### resolveEventHandler()

```ts
protected resolveEventHandler(): AdapterEventHandlerType<IncomingEventType, OutgoingResponseType>;
```

Get the event handler for the adapter.

#### Returns

[`AdapterEventHandlerType`](../../../declarations/type-aliases/AdapterEventHandlerType.md)\<`IncomingEventType`, `OutgoingResponseType`\>

The event handler for the adapter.

#### Throws

If the event handler is missing.

***

### run()

```ts
abstract run<ExecutionResultType>(): Promise<ExecutionResultType>;
```

Run handler.

#### Type Parameters

##### ExecutionResultType

`ExecutionResultType` = `unknown`

#### Returns

`Promise`\<`ExecutionResultType`\>

The result of the handler execution.

#### Example

Implementation flow
```ts
await this.executeHooks('onStart');
const eventHandlerResolver = this.blueprint.get('stone.adapter.eventHandlerResolver');
const eventHandler = eventHandlerResolver(this.blueprint)
await this.executeHooks('onInit', eventHandler);
const rawEvent: MockRawEvent = { name: 'Stone.js' }
const context: AdapterContext<MockRawEvent, MockRawResponse, any, IncomingEvent, IncomingEventOptions, OutgoingResponse> = {
  rawEvent,
  incomingEventBuilder: AdapterBuilder.create<IncomingEventOptions, IncomingEvent>({ resolver: v => IncomingEvent.create(v) }),
  rawResponseBuilder: AdapterBuilder.create<RawResponseOptions, MockRawResponseWrapper>({ resolver: v => new MockRawResponseWrapper(v) })
}
return await this.sendEventThroughDestination(context, eventHandler);
```

#### Implementation of

[`IAdapter`](../../../declarations/interfaces/IAdapter.md).[`run`](../../../declarations/interfaces/IAdapter.md#run)

***

### sendEventThroughDestination()

```ts
protected sendEventThroughDestination(context, eventHandler): Promise<RawResponseType>;
```

Send the raw event through the destination.

#### Parameters

##### context

`AdapterContextType`

The event context.

##### eventHandler

[`AdapterEventHandlerType`](../../../declarations/type-aliases/AdapterEventHandlerType.md)\<`IncomingEventType`, `OutgoingResponseType`\>

The event handler to be run.

#### Returns

`Promise`\<`RawResponseType`\>

Platform-specific response.

#### Throws

IntegrationError

***

### validateContextAndEventHandler()

```ts
protected validateContextAndEventHandler(context, eventHandler): void;
```

Validate the context and event handler.

#### Parameters

##### context

`AdapterContextType`

The context to validate.

##### eventHandler

[`AdapterEventHandlerType`](../../../declarations/type-aliases/AdapterEventHandlerType.md)\<`IncomingEventType`, `OutgoingResponseType`\>

The event handler to validate.

#### Returns

`void`

#### Throws

IntegrationError
