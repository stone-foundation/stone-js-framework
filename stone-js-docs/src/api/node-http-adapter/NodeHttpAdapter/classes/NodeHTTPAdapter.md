# Class: NodeHttpAdapter

Node.js HTTP Adapter for the Stone.js framework.

The `NodeHTTPAdapter` is responsible for integrating a Node.js HTTP/HTTPS server
with the Stone.js framework, converting incoming HTTP requests into `IncomingHttpEvent`
instances, and processing outgoing responses into the `OutgoingHttpResponse` format.

It provides lifecycle hooks for initialization, termination, and error handling,
ensuring seamless integration with Stone.js.

## Template

The raw HTTP event type (e.g., `IncomingMessage`).

## Template

The raw HTTP response type (e.g., `ServerResponse`).

## Template

The server instance type (e.g., `NodeHttpServer`).

## Template

The Stone.js incoming event type (e.g., `IncomingHttpEvent`).

## Template

Options for creating an incoming event.

## Template

The outgoing response type (e.g., `OutgoingHttpResponse`).

## Template

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

### logger

```ts
protected readonly logger: ILogger;
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
