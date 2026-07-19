[**Testing**](../../README.md)

***

[Testing](../../README.md) / [TestAdapter](../README.md) / TestAdapter

# Class: TestAdapter

An in-memory adapter used only for tests.

Instead of a server, `run()` returns a [TestClient](../../TestClient/classes/TestClient.md) whose `send` pushes a caller-supplied
`IncomingEvent` straight through the real adapter + kernel pipeline and returns the resulting
`OutgoingResponse`. There is no request normalisation (you provide a ready event) and the raw
response IS the outgoing response, so assertions see exactly what your handlers produced.

## Extends

- `Adapter`\<`IncomingEvent`, `OutgoingResponse`, [`TestExecutionContext`](../../declarations/type-aliases/TestExecutionContext.md), `IncomingEvent`, `IncomingEventOptions`, `OutgoingResponse`, [`TestAdapterContext`](../../declarations/type-aliases/TestAdapterContext.md)\>

## Constructors

### Constructor

> `protected` **new TestAdapter**(`blueprint`): `TestAdapter`

Create an Adapter.

#### Parameters

##### blueprint

`IBlueprint`

The blueprint to create the adapter.

#### Returns

`TestAdapter`

#### Inherited from

`Adapter< IncomingEvent, OutgoingResponse, TestExecutionContext, IncomingEvent, IncomingEventOptions, OutgoingResponse, TestAdapterContext >.constructor`

## Properties

### blueprint

> `protected` `readonly` **blueprint**: `IBlueprint`

#### Inherited from

`Adapter.blueprint`

***

### hooks

> `protected` `readonly` **hooks**: `AdapterHookType`\<[`TestAdapterContext`](../../declarations/type-aliases/TestAdapterContext.md), `OutgoingResponse`\>

#### Inherited from

`Adapter.hooks`

***

### middleware

> `protected` `readonly` **middleware**: `AdapterMixedPipeType`\<[`TestAdapterContext`](../../declarations/type-aliases/TestAdapterContext.md), `OutgoingResponse`\>[]

#### Inherited from

`Adapter.middleware`

***

### resolvedErrorHandlers

> `protected` `readonly` **resolvedErrorHandlers**: `Record`\<`string`, `IAdapterErrorHandler`\<`RawEventType`, `RawResponseType`, `ExecutionContextType`\>\>

#### Inherited from

`Adapter.resolvedErrorHandlers`

## Methods

### buildRawResponse()

> `protected` **buildRawResponse**(`context`): `Promise`\<`OutgoingResponse`\>

The raw response for a test IS the outgoing response the handlers produced.

#### Parameters

##### context

[`TestAdapterContext`](../../declarations/type-aliases/TestAdapterContext.md)

The adapter context.

#### Returns

`Promise`\<`OutgoingResponse`\>

The outgoing response.

#### Overrides

`Adapter.buildRawResponse`

***

### dispatch()

> `protected` **dispatch**(`event`): `Promise`\<`OutgoingResponse`\>

Dispatch one event through the kernel and return the outgoing response.

#### Parameters

##### event

`IncomingEvent`

The incoming event.

#### Returns

`Promise`\<`OutgoingResponse`\>

The outgoing response.

***

### executeEventHandlerHooks()

> `protected` **executeEventHandlerHooks**(`hook`, `eventHandler`): `Promise`\<`void`\>

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

`Adapter.executeEventHandlerHooks`

***

### executeHooks()

> `protected` **executeHooks**(`name`, `context?`, `error?`): `Promise`\<`void`\>

Execute adapter lifecycle hooks.

#### Parameters

##### name

`AdapterHookName`

The hook's name.

##### context?

[`TestAdapterContext`](../../declarations/type-aliases/TestAdapterContext.md)

The event context.

##### error?

`any`

The error to handle.

#### Returns

`Promise`\<`void`\>

#### Inherited from

`Adapter.executeHooks`

***

### handleError()

> `protected` **handleError**(`error`, `context`): `Promise`\<`AdapterEventBuilderType`\<`OutgoingResponse`\>\>

Handle error.

#### Parameters

##### error

`Error`

The error to handle.

##### context

[`TestAdapterContext`](../../declarations/type-aliases/TestAdapterContext.md)

The event context.

#### Returns

`Promise`\<`AdapterEventBuilderType`\<`OutgoingResponse`\>\>

The raw response.

#### Inherited from

`Adapter.handleError`

***

### handleEvent()

> `protected` **handleEvent**(`context`, `eventHandler`): `Promise`\<`IAdapterEventBuilder`\<`RawResponseOptions`, `IRawResponseWrapper`\<`OutgoingResponse`\>\>\>

Handle the event.

#### Parameters

##### context

[`TestAdapterContext`](../../declarations/type-aliases/TestAdapterContext.md)

The event context.

##### eventHandler

`AdapterEventHandlerType`\<`IncomingEvent`, `OutgoingResponse`\>

The event handler to be run.

#### Returns

`Promise`\<`IAdapterEventBuilder`\<`RawResponseOptions`, `IRawResponseWrapper`\<`OutgoingResponse`\>\>\>

The raw response wrapper.

#### Inherited from

`Adapter.handleEvent`

***

### makePipelineOptions()

> `protected` **makePipelineOptions**(): `PipelineOptions`\<[`TestAdapterContext`](../../declarations/type-aliases/TestAdapterContext.md), `AdapterEventBuilderType`\<`OutgoingResponse`\>\>

Create pipeline options for the Adapter.

#### Returns

`PipelineOptions`\<[`TestAdapterContext`](../../declarations/type-aliases/TestAdapterContext.md), `AdapterEventBuilderType`\<`OutgoingResponse`\>\>

The pipeline options for transforming the event.

#### Inherited from

`Adapter.makePipelineOptions`

***

### onStart()

> `protected` **onStart**(): `Promise`\<`void`\>

Lifecycle hook run once before the first dispatch.

#### Returns

`Promise`\<`void`\>

***

### resolveErrorHandler()

> `protected` **resolveErrorHandler**(`error`): `IAdapterErrorHandler`\<`IncomingEvent`, `OutgoingResponse`, [`TestExecutionContext`](../../declarations/type-aliases/TestExecutionContext.md)\>

Get the error handler for the given error.

#### Parameters

##### error

`Error`

The error to get the handler for.

#### Returns

`IAdapterErrorHandler`\<`IncomingEvent`, `OutgoingResponse`, [`TestExecutionContext`](../../declarations/type-aliases/TestExecutionContext.md)\>

The error handler.

#### Throws

IntegrationError

#### Inherited from

`Adapter.resolveErrorHandler`

***

### resolveEventHandler()

> `protected` **resolveEventHandler**(): `AdapterEventHandlerType`\<`IncomingEvent`, `OutgoingResponse`\>

Get the event handler for the adapter.

#### Returns

`AdapterEventHandlerType`\<`IncomingEvent`, `OutgoingResponse`\>

The event handler for the adapter.

#### Throws

If the event handler is missing.

#### Inherited from

`Adapter.resolveEventHandler`

***

### run()

> **run**\<`ExecutionResultType`\>(): `Promise`\<`ExecutionResultType`\>

Start the adapter and return a test client.

#### Type Parameters

##### ExecutionResultType

`ExecutionResultType` = [`TestClient`](../../TestClient/classes/TestClient.md)

#### Returns

`Promise`\<`ExecutionResultType`\>

The test client.

#### Overrides

`Adapter.run`

***

### sendEventThroughDestination()

> `protected` **sendEventThroughDestination**(`context`, `eventHandler`): `Promise`\<`OutgoingResponse`\>

Send the raw event through the destination.

#### Parameters

##### context

[`TestAdapterContext`](../../declarations/type-aliases/TestAdapterContext.md)

The event context.

##### eventHandler

`AdapterEventHandlerType`\<`IncomingEvent`, `OutgoingResponse`\>

The event handler to be run.

#### Returns

`Promise`\<`OutgoingResponse`\>

Platform-specific response.

#### Throws

IntegrationError

#### Inherited from

`Adapter.sendEventThroughDestination`

***

### validateContextAndEventHandler()

> `protected` **validateContextAndEventHandler**(`context`, `eventHandler`): `void`

Validate the context and event handler.

#### Parameters

##### context

[`TestAdapterContext`](../../declarations/type-aliases/TestAdapterContext.md)

The context to validate.

##### eventHandler

`AdapterEventHandlerType`\<`IncomingEvent`, `OutgoingResponse`\>

The event handler to validate.

#### Returns

`void`

#### Throws

IntegrationError

#### Inherited from

`Adapter.validateContextAndEventHandler`

***

### create()

> `static` **create**(`blueprint`): `TestAdapter`

#### Parameters

##### blueprint

`IBlueprint`

The application blueprint.

#### Returns

`TestAdapter`

A new adapter instance.
