# Class: NodeHttpAdapter

Node.js HTTP Adapter for the Stone.js framework.

The `NodeHTTPAdapter` is responsible for integrating a Node.js HTTP/HTTPS server
with the Stone.js framework, converting incoming HTTP requests into `IncomingHttpEvent`
instances, and processing outgoing responses into the `OutgoingHttpResponse` format.

It provides lifecycle hooks for initialization, termination, and error handling,
ensuring seamless integration with Stone.js.

## Template

**RawEvent**

The raw HTTP event type (e.g., `IncomingMessage`).

## Template

**RawResponse**

The raw HTTP response type (e.g., `ServerResponse`).

## Template

**Server**

The server instance type (e.g., `NodeHttpServer`).

## Template

**IncomingEvent**

The Stone.js incoming event type (e.g., `IncomingHttpEvent`).

## Template

**IncomingEventOptions**

Options for creating an incoming event.

## Template

**OutgoingResponse**

The outgoing response type (e.g., `OutgoingHttpResponse`).

## Template

**Context**

The adapter context type (e.g., `NodeHttpAdapterContext`).

## Extends

- `Adapter`\<`IncomingMessage`, `ServerResponse`, [`NodeHttpServer`](../../declarations/type-aliases/NodeHttpServer.md), `IncomingHttpEvent`, `IncomingHttpEventOptions`, `OutgoingHttpResponse`, [`NodeHttpAdapterContext`](../../declarations/interfaces/NodeHttpAdapterContext.md)\>

## Constructors

### Constructor

```ts
protected new NodeHttpAdapter(blueprint): NodeHttpAdapter;
```

Constructs a `NodeHTTPAdapter` instance.

This constructor is protected and is intended to be used via the static `create` method.

#### Parameters

##### blueprint

`IBlueprint`

The application blueprint for dependency resolution.

#### Returns

`NodeHttpAdapter`

#### Overrides

```ts
Adapter<
IncomingMessage,
ServerResponse,
NodeHttpServer,
IncomingHttpEvent,
IncomingHttpEventOptions,
OutgoingHttpResponse,
NodeHttpAdapterContext
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
protected readonly hooks: AdapterHookType<NodeHttpAdapterContext, ServerResponse<IncomingMessage>>;
```

#### Inherited from

```ts
Adapter.hooks
```

***

### logger

```ts
protected readonly logger: ILogger;
```

***

### middleware

```ts
protected readonly middleware: AdapterMixedPipeType<NodeHttpAdapterContext, ServerResponse<IncomingMessage>>[];
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

***

### server

```ts
protected readonly server: NodeHttpServer;
```

***

### url

```ts
protected readonly url: URL;
```

## Methods

### buildRawResponse()

```ts
protected buildRawResponse(context, eventHandler?): Promise<ServerResponse<IncomingMessage>>;
```

Build the raw response.

#### Parameters

##### context

[`NodeHttpAdapterContext`](../../declarations/interfaces/NodeHttpAdapterContext.md)

The event context.

##### eventHandler?

`AdapterEventHandlerType`\<`IncomingHttpEvent`, `OutgoingHttpResponse`\>

The event handler to be run.

#### Returns

`Promise`\<`ServerResponse`\<`IncomingMessage`\>\>

The raw response wrapper.

#### Inherited from

```ts
Adapter.buildRawResponse
```

***

### createServer()

```ts
protected createServer(): NodeHttpServer;
```

Creates the HTTP or HTTPS server based on the adapter's configuration.

#### Returns

[`NodeHttpServer`](../../declarations/type-aliases/NodeHttpServer.md)

A `NodeHttpServer` instance.

***

### eventListener()

```ts
protected eventListener(rawEvent, rawResponse): Promise<ServerResponse<IncomingMessage>>;
```

Handles incoming HTTP requests and sends them through the adapter's event pipeline.

#### Parameters

##### rawEvent

`IncomingMessage`

The raw HTTP request object.

##### rawResponse

`ServerResponse`

The raw HTTP response object.

#### Returns

`Promise`\<`ServerResponse`\<`IncomingMessage`\>\>

A promise resolving to a ServerResponse (e.g., `ServerResponse`).

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

[`NodeHttpAdapterContext`](../../declarations/interfaces/NodeHttpAdapterContext.md)

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
protected handleError(error, context): Promise<AdapterEventBuilderType<ServerResponse<IncomingMessage>>>;
```

Handle error.

#### Parameters

##### error

`Error`

The error to handle.

##### context

[`NodeHttpAdapterContext`](../../declarations/interfaces/NodeHttpAdapterContext.md)

The event context.

#### Returns

`Promise`\<`AdapterEventBuilderType`\<`ServerResponse`\<`IncomingMessage`\>\>\>

The raw response.

#### Inherited from

```ts
Adapter.handleError
```

***

### handleEvent()

```ts
protected handleEvent(context, eventHandler): Promise<IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<ServerResponse<IncomingMessage>>>>;
```

Handle the event.

#### Parameters

##### context

[`NodeHttpAdapterContext`](../../declarations/interfaces/NodeHttpAdapterContext.md)

The event context.

##### eventHandler

`AdapterEventHandlerType`\<`IncomingHttpEvent`, `OutgoingHttpResponse`\>

The event handler to be run.

#### Returns

`Promise`\<`IAdapterEventBuilder`\<`RawResponseOptions`, `IRawResponseWrapper`\<`ServerResponse`\<`IncomingMessage`\>\>\>\>

The raw response wrapper.

#### Inherited from

```ts
Adapter.handleEvent
```

***

### hardenServer()

```ts
protected hardenServer(server): NodeHttpServer;
```

Applies denial-of-service hardening to the HTTP(S) server.

Sets strict defaults for header count and connection timeouts (Slowloris, socket
exhaustion, header floods). Every knob is overridable via `stone.adapter.server`
(e.g. `{ headersTimeout: 30000, maxHeadersCount: 60 }`); `maxRequestsPerSocket` is
only applied when explicitly configured.

#### Parameters

##### server

[`NodeHttpServer`](../../declarations/type-aliases/NodeHttpServer.md)

The freshly created server.

#### Returns

[`NodeHttpServer`](../../declarations/type-aliases/NodeHttpServer.md)

The hardened server.

***

### makePipelineOptions()

```ts
protected makePipelineOptions(): PipelineOptions<NodeHttpAdapterContext, AdapterEventBuilderType<ServerResponse<IncomingMessage>>>;
```

Create pipeline options for the Adapter.

#### Returns

`PipelineOptions`\<[`NodeHttpAdapterContext`](../../declarations/interfaces/NodeHttpAdapterContext.md), `AdapterEventBuilderType`\<`ServerResponse`\<`IncomingMessage`\>\>\>

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

Lifecycle hook for adapter initialization.

This method is called during the adapter's startup process and performs tasks
such as setting up exception listeners and verifying the runtime environment.

#### Returns

`Promise`\<`void`\>

#### Throws

If the adapter is used outside a Node.js context.

***

### resolveErrorHandler()

```ts
protected resolveErrorHandler(error): IAdapterErrorHandler<IncomingMessage, ServerResponse<IncomingMessage>, NodeHttpServer>;
```

Get the error handler for the given error.

#### Parameters

##### error

`Error`

The error to get the handler for.

#### Returns

`IAdapterErrorHandler`\<`IncomingMessage`, `ServerResponse`\<`IncomingMessage`\>, [`NodeHttpServer`](../../declarations/type-aliases/NodeHttpServer.md)\>

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

Starts the HTTP/HTTPS server and listens for incoming requests.

#### Type Parameters

##### ExecutionResultType

`ExecutionResultType` = [`NodeHttpServer`](../../declarations/type-aliases/NodeHttpServer.md)

#### Returns

`Promise`\<`ExecutionResultType`\>

A promise that resolves to an ExecutionResultType (usually `NodeHttpServer`) when the server starts successfully.

#### Throws

If the server encounters an error during initialization.

#### Example

```typescript
const adapter = NodeHTTPAdapter.create(options);
await adapter.run();
console.log('Server is running');
```

#### Overrides

```ts
Adapter.run
```

***

### sendEventThroughDestination()

```ts
protected sendEventThroughDestination(context, eventHandler): Promise<ServerResponse<IncomingMessage>>;
```

Send the raw event through the destination.

#### Parameters

##### context

[`NodeHttpAdapterContext`](../../declarations/interfaces/NodeHttpAdapterContext.md)

The event context.

##### eventHandler

`AdapterEventHandlerType`\<`IncomingHttpEvent`, `OutgoingHttpResponse`\>

The event handler to be run.

#### Returns

`Promise`\<`ServerResponse`\<`IncomingMessage`\>\>

Platform-specific response.

#### Throws

IntegrationError

#### Inherited from

```ts
Adapter.sendEventThroughDestination
```

***

### setupGlobalErrorHandlers()

```ts
protected setupGlobalErrorHandlers(): void;
```

Sets up global error handlers for uncaught exceptions and unhandled rejections.
Ensures critical errors are logged and the process exits safely.

#### Returns

`void`

***

### setupShutdownHook()

```ts
protected setupShutdownHook(): void;
```

Sets up a shutdown listener to gracefully stop the server on SIGINT.

#### Returns

`void`

***

### validateContextAndEventHandler()

```ts
protected validateContextAndEventHandler(context, eventHandler): void;
```

Validate the context and event handler.

#### Parameters

##### context

[`NodeHttpAdapterContext`](../../declarations/interfaces/NodeHttpAdapterContext.md)

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
static create(blueprint): NodeHttpAdapter;
```

Creates a new `NodeHTTPAdapter` instance.

#### Parameters

##### blueprint

`IBlueprint`

The application blueprint.

#### Returns

`NodeHttpAdapter`

A new instance of `NodeHTTPAdapter`.

#### Example

```typescript
const adapter = NodeHTTPAdapter.create(blueprint);
await adapter.run();
```
