[**FetchAdapter**](../../README.md)

***

[FetchAdapter](../../README.md) / [FetchAdapter](../README.md) / FetchAdapter

# Class: FetchAdapter

Web-standard (WinterCG Fetch) adapter for Stone.js.

Unlike a server adapter, `run()` does not start a listener — it returns a Fetch handler
`(request, executionContext?) => Promise<Response>`, exactly what every WinterCG runtime
expects. Wire it once and deploy the same build to Cloudflare Workers, Deno, Bun, Vercel Edge
or Netlify Edge.

## Example

```ts
const handle = await FetchAdapter.create(blueprint).run<FetchEventHandlerFunction>()
export default { fetch: handle } // Cloudflare / Deno / Bun / Edge
```

## Extends

- `Adapter`\<`Request`, `Response`, [`FetchExecutionContext`](../../declarations/type-aliases/FetchExecutionContext.md), `IncomingHttpEvent`, `IncomingHttpEventOptions`, `OutgoingHttpResponse`, [`FetchAdapterContext`](../../declarations/type-aliases/FetchAdapterContext.md)\>

## Constructors

### Constructor

> `protected` **new FetchAdapter**(`blueprint`): `FetchAdapter`

Create an Adapter.

#### Parameters

##### blueprint

`IBlueprint`

The blueprint to create the adapter.

#### Returns

`FetchAdapter`

#### Inherited from

`Adapter< Request, Response, FetchExecutionContext, IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse, FetchAdapterContext >.constructor`

## Properties

### blueprint

> `protected` `readonly` **blueprint**: `IBlueprint`

#### Inherited from

`Adapter.blueprint`

***

### hooks

> `protected` `readonly` **hooks**: `AdapterHookType`\<[`FetchAdapterContext`](../../declarations/type-aliases/FetchAdapterContext.md), `Response`\>

#### Inherited from

`Adapter.hooks`

***

### middleware

> `protected` `readonly` **middleware**: `AdapterMixedPipeType`\<[`FetchAdapterContext`](../../declarations/type-aliases/FetchAdapterContext.md), `Response`\>[]

#### Inherited from

`Adapter.middleware`

***

### resolvedErrorHandlers

> `protected` `readonly` **resolvedErrorHandlers**: `Record`\<`string`, `IAdapterErrorHandler`\<`RawEventType`, `RawResponseType`, `ExecutionContextType`\>\>

#### Inherited from

`Adapter.resolvedErrorHandlers`

## Methods

### buildRawResponse()

> `protected` **buildRawResponse**(`context`, `eventHandler?`): `Promise`\<`Response`\>

Build the raw response.

#### Parameters

##### context

[`FetchAdapterContext`](../../declarations/type-aliases/FetchAdapterContext.md)

The event context.

##### eventHandler?

`AdapterEventHandlerType`\<`IncomingHttpEvent`, `OutgoingHttpResponse`\>

The event handler to be run.

#### Returns

`Promise`\<`Response`\>

The raw response wrapper.

#### Inherited from

`Adapter.buildRawResponse`

***

### eventListener()

> `protected` **eventListener**(`rawEvent`, `executionContext`): `Promise`\<`Response`\>

Handle a single Web `Request`, producing a Web `Response`.

#### Parameters

##### rawEvent

`Request`

The incoming request.

##### executionContext

[`FetchExecutionContext`](../../declarations/type-aliases/FetchExecutionContext.md)

The runtime-provided context (e.g. Cloudflare `env`/`ctx`).

#### Returns

`Promise`\<`Response`\>

The response.

***

### executeEventHandlerHooks()

> `protected` **executeEventHandlerHooks**(`hook`, `eventHandler`): `Promise`\<`void`\>

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

[`FetchAdapterContext`](../../declarations/type-aliases/FetchAdapterContext.md)

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

> `protected` **handleError**(`error`, `context`): `Promise`\<`AdapterEventBuilderType`\<`Response`\>\>

Handle error.

#### Parameters

##### error

`Error`

The error to handle.

##### context

[`FetchAdapterContext`](../../declarations/type-aliases/FetchAdapterContext.md)

The event context.

#### Returns

`Promise`\<`AdapterEventBuilderType`\<`Response`\>\>

The raw response.

#### Inherited from

`Adapter.handleError`

***

### handleEvent()

> `protected` **handleEvent**(`context`, `eventHandler`): `Promise`\<`IAdapterEventBuilder`\<`RawResponseOptions`, `IRawResponseWrapper`\<`Response`\>\>\>

Handle the event.

#### Parameters

##### context

[`FetchAdapterContext`](../../declarations/type-aliases/FetchAdapterContext.md)

The event context.

##### eventHandler

`AdapterEventHandlerType`\<`IncomingHttpEvent`, `OutgoingHttpResponse`\>

The event handler to be run.

#### Returns

`Promise`\<`IAdapterEventBuilder`\<`RawResponseOptions`, `IRawResponseWrapper`\<`Response`\>\>\>

The raw response wrapper.

#### Inherited from

`Adapter.handleEvent`

***

### makePipelineOptions()

> `protected` **makePipelineOptions**(): `PipelineOptions`\<[`FetchAdapterContext`](../../declarations/type-aliases/FetchAdapterContext.md), `AdapterEventBuilderType`\<`Response`\>\>

Create pipeline options for the Adapter.

#### Returns

`PipelineOptions`\<[`FetchAdapterContext`](../../declarations/type-aliases/FetchAdapterContext.md), `AdapterEventBuilderType`\<`Response`\>\>

The pipeline options for transforming the event.

#### Inherited from

`Adapter.makePipelineOptions`

***

### onStart()

> `protected` **onStart**(): `Promise`\<`void`\>

Lifecycle hook run once before the first request.

#### Returns

`Promise`\<`void`\>

***

### resolveErrorHandler()

> `protected` **resolveErrorHandler**(`error`): `IAdapterErrorHandler`\<`Request`, `Response`, [`FetchExecutionContext`](../../declarations/type-aliases/FetchExecutionContext.md)\>

Get the error handler for the given error.

#### Parameters

##### error

`Error`

The error to get the handler for.

#### Returns

`IAdapterErrorHandler`\<`Request`, `Response`, [`FetchExecutionContext`](../../declarations/type-aliases/FetchExecutionContext.md)\>

The error handler.

#### Throws

IntegrationError

#### Inherited from

`Adapter.resolveErrorHandler`

***

### resolveEventHandler()

> `protected` **resolveEventHandler**(): `AdapterEventHandlerType`\<`IncomingHttpEvent`, `OutgoingHttpResponse`\>

Get the event handler for the adapter.

#### Returns

`AdapterEventHandlerType`\<`IncomingHttpEvent`, `OutgoingHttpResponse`\>

The event handler for the adapter.

#### Throws

If the event handler is missing.

#### Inherited from

`Adapter.resolveEventHandler`

***

### run()

> **run**\<`ExecutionResultType`\>(): `Promise`\<`ExecutionResultType`\>

Start the adapter and return a Fetch handler.

#### Type Parameters

##### ExecutionResultType

`ExecutionResultType` = [`FetchEventHandlerFunction`](../../declarations/type-aliases/FetchEventHandlerFunction.md)

#### Returns

`Promise`\<`ExecutionResultType`\>

The Fetch handler.

#### Overrides

`Adapter.run`

***

### sendEventThroughDestination()

> `protected` **sendEventThroughDestination**(`context`, `eventHandler`): `Promise`\<`Response`\>

Send the raw event through the destination.

#### Parameters

##### context

[`FetchAdapterContext`](../../declarations/type-aliases/FetchAdapterContext.md)

The event context.

##### eventHandler

`AdapterEventHandlerType`\<`IncomingHttpEvent`, `OutgoingHttpResponse`\>

The event handler to be run.

#### Returns

`Promise`\<`Response`\>

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

[`FetchAdapterContext`](../../declarations/type-aliases/FetchAdapterContext.md)

The context to validate.

##### eventHandler

`AdapterEventHandlerType`\<`IncomingHttpEvent`, `OutgoingHttpResponse`\>

The event handler to validate.

#### Returns

`void`

#### Throws

IntegrationError

#### Inherited from

`Adapter.validateContextAndEventHandler`

***

### create()

> `static` **create**(`blueprint`): `FetchAdapter`

#### Parameters

##### blueprint

`IBlueprint`

The application blueprint.

#### Returns

`FetchAdapter`

A new adapter instance.
