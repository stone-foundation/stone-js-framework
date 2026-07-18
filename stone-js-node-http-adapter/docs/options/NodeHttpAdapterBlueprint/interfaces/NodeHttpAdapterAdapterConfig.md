# Interface: NodeHttpAdapterAdapterConfig

NodeHttpAdapterAdapterConfig Interface.

This interface defines the configuration options for the Node HTTP adapter
within the Stone.js framework. It includes settings such as the adapter's alias,
resolver, middleware, hooks, and server configurations.

## Extends

- `AdapterConfig`\<`IncomingMessage`, `ServerResponse`, [`NodeHttpServer`](../../../declarations/type-aliases/NodeHttpServer.md), `IncomingHttpEvent`, `IncomingHttpEventOptions`, `OutgoingHttpResponse`\>

## Properties

### alias?

```ts
optional alias?: string;
```

The alias name for the adapter.
This is a unique identifier used to reference the adapter.
Optional property.

#### Inherited from

```ts
AdapterConfig.alias
```

***

### current?

```ts
optional current?: boolean;
```

The current status identifier for the adapter.
Used to indicate if this adapter instance is active or currently in use.
Optional property.

#### Inherited from

```ts
AdapterConfig.current
```

***

### default?

```ts
optional default?: boolean;
```

Defines whether this adapter is the default adapter used by the application.
Optional property.

#### Inherited from

```ts
AdapterConfig.default
```

***

### errorHandlers

```ts
errorHandlers: Record<string, MetaAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>>;
```

Error handlers used to manage and report errors that occur within the adapter.
These handlers can be used to customize error handling behavior and logging.

#### Inherited from

```ts
AdapterConfig.errorHandlers
```

***

### eventHandlerResolver

```ts
eventHandlerResolver: AdapterEventHandlerResolver<IncomingHttpEvent, OutgoingHttpResponse>;
```

The event handler resolver used to create instances of the event handler.

#### Inherited from

```ts
AdapterConfig.eventHandlerResolver
```

***

### isSsl?

```ts
optional isSsl?: boolean;
```

Determines if the server should use SSL.

***

### middleware

```ts
middleware: AdapterMixedPipeType<AdapterContext<IncomingMessage, ServerResponse<IncomingMessage>, NodeHttpServer, IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse>, ServerResponse<IncomingMessage>>[];
```

The middleware used for processing incoming or outgoing data in the adapter.
Middleware can modify or handle events at different stages of the adapter's lifecycle.

#### Inherited from

```ts
AdapterConfig.middleware
```

***

### platform

```ts
platform: string;
```

The platform identifier for the adapter.
This is used to categorize the adapter based on the environment or technology it supports.

#### Inherited from

```ts
AdapterConfig.platform
```

***

### printUrls?

```ts
optional printUrls?: boolean;
```

Determines if the server should print the URL when starting.

***

### resolver

```ts
resolver: AdapterResolver;
```

The class type resolver used to create instances of the adapter.

#### Inherited from

```ts
AdapterConfig.resolver
```

***

### server

```ts
server: NodeServerOptions;
```

Additional server configurations for the Node HTTP server.

***

### serverMiddleware

```ts
serverMiddleware: ServerMiddleware[];
```

The platform middleware used for processing platform node HTTP requests and responses.
This middleware is executed before the adapter middleware.
This middleware is lower-level and should be used for platform-specific processing.
You can connect or express like middleware here to process request just before the Stone adapter middleware.

***

### url

```ts
url: string;
```

The base URL used by the node http to run the application.

***

### variant

```ts
variant: "server" | "browser" | "console";
```

The class type of the adapter.
This is used to identify the category of the adapter.

#### Inherited from

```ts
AdapterConfig.variant
```
