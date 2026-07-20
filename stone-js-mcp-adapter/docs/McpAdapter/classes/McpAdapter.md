[**McpAdapter**](../../README.md)

***

[McpAdapter](../../README.md) / [McpAdapter](../README.md) / McpAdapter

# Class: McpAdapter

Model Context Protocol adapter for Stone.js.

MCP is just another Continuum context: a tool call is a *cause* that becomes an `IncomingEvent`,
flows through the kernel (middleware, DI, hooks) via the [McpDispatcher](../../McpDispatcher/README.md), and its result
is returned as MCP content. `run()` starts an MCP server (stdio by default) advertising every
configured tool — so an AI agent consumes your domain exactly like a REST client would, with no
changes to your handlers.

## Extends

- `Adapter`\<`IncomingEvent`, `OutgoingResponse`, [`McpExecutionContext`](../../declarations/type-aliases/McpExecutionContext.md), `IncomingEvent`, `IncomingEventOptions`, `OutgoingResponse`, [`McpAdapterContext`](../../declarations/type-aliases/McpAdapterContext.md)\>

## Constructors

### Constructor

> `protected` **new McpAdapter**(`blueprint`): `McpAdapter`

Create an Adapter.

#### Parameters

##### blueprint

`IBlueprint`

The blueprint to create the adapter.

#### Returns

`McpAdapter`

#### Inherited from

`Adapter< IncomingEvent, OutgoingResponse, McpExecutionContext, IncomingEvent, IncomingEventOptions, OutgoingResponse, McpAdapterContext >.constructor`

## Properties

### blueprint

> `protected` `readonly` **blueprint**: `IBlueprint`

#### Inherited from

`Adapter.blueprint`

***

### hooks

> `protected` `readonly` **hooks**: `AdapterHookType`\<[`McpAdapterContext`](../../declarations/type-aliases/McpAdapterContext.md), `OutgoingResponse`\>

#### Inherited from

`Adapter.hooks`

***

### middleware

> `protected` `readonly` **middleware**: `AdapterMixedPipeType`\<[`McpAdapterContext`](../../declarations/type-aliases/McpAdapterContext.md), `OutgoingResponse`\>[]

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

The raw response IS the outgoing response the kernel produced.

#### Parameters

##### context

[`McpAdapterContext`](../../declarations/type-aliases/McpAdapterContext.md)

The adapter context.

#### Returns

`Promise`\<`OutgoingResponse`\>

The outgoing response.

#### Overrides

`Adapter.buildRawResponse`

***

### dispatch()

> `protected` **dispatch**(`name`, `args`): `Promise`\<[`CallToolResult`](../../toContent/interfaces/CallToolResult.md)\>

Dispatch one tool call through the kernel and return an MCP tool result.

#### Parameters

##### name

`string`

The tool name.

##### args

`Record`\<`string`, `unknown`\>

The validated arguments.

#### Returns

`Promise`\<[`CallToolResult`](../../toContent/interfaces/CallToolResult.md)\>

The MCP tool result.

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

[`McpAdapterContext`](../../declarations/type-aliases/McpAdapterContext.md)

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

[`McpAdapterContext`](../../declarations/type-aliases/McpAdapterContext.md)

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

[`McpAdapterContext`](../../declarations/type-aliases/McpAdapterContext.md)

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

> `protected` **makePipelineOptions**(): `PipelineOptions`\<[`McpAdapterContext`](../../declarations/type-aliases/McpAdapterContext.md), `AdapterEventBuilderType`\<`OutgoingResponse`\>\>

Create pipeline options for the Adapter.

#### Returns

`PipelineOptions`\<[`McpAdapterContext`](../../declarations/type-aliases/McpAdapterContext.md), `AdapterEventBuilderType`\<`OutgoingResponse`\>\>

The pipeline options for transforming the event.

#### Inherited from

`Adapter.makePipelineOptions`

***

### onStart()

> `protected` **onStart**(): `Promise`\<`void`\>

Lifecycle hook run once before serving.

#### Returns

`Promise`\<`void`\>

***

### resolveErrorHandler()

> `protected` **resolveErrorHandler**(`error`): `IAdapterErrorHandler`\<`IncomingEvent`, `OutgoingResponse`, [`McpExecutionContext`](../../declarations/type-aliases/McpExecutionContext.md)\>

Get the error handler for the given error.

#### Parameters

##### error

`Error`

The error to get the handler for.

#### Returns

`IAdapterErrorHandler`\<`IncomingEvent`, `OutgoingResponse`, [`McpExecutionContext`](../../declarations/type-aliases/McpExecutionContext.md)\>

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

Start the MCP server, register the tools and connect the transport.

#### Type Parameters

##### ExecutionResultType

`ExecutionResultType` = `McpServer`

#### Returns

`Promise`\<`ExecutionResultType`\>

The connected MCP server.

#### Overrides

`Adapter.run`

***

### sendEventThroughDestination()

> `protected` **sendEventThroughDestination**(`context`, `eventHandler`): `Promise`\<`OutgoingResponse`\>

Send the raw event through the destination.

#### Parameters

##### context

[`McpAdapterContext`](../../declarations/type-aliases/McpAdapterContext.md)

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

[`McpAdapterContext`](../../declarations/type-aliases/McpAdapterContext.md)

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

> `static` **create**(`blueprint`): `McpAdapter`

#### Parameters

##### blueprint

`IBlueprint`

The application blueprint.

#### Returns

`McpAdapter`

A new adapter instance.
