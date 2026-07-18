# Interface: NodeHttpAdapterAdapterConfig

NodeHttpAdapterAdapterConfig Interface.

This interface defines the configuration options for the Node HTTP adapter
within the Stone.js framework. It includes settings such as the adapter's alias,
resolver, middleware, hooks, and server configurations.

## Extends

- `AdapterConfig`\<`IncomingMessage`, `ServerResponse`, [`NodeHttpServer`](../../../declarations/type-aliases/NodeHttpServer.md), `IncomingHttpEvent`, `IncomingHttpEventOptions`, `OutgoingHttpResponse`\>

## Properties

### isSsl?

```ts
optional isSsl: boolean;
```

Determines if the server should use SSL.

***

### printUrls?

```ts
optional printUrls: boolean;
```

Determines if the server should print the URL when starting.

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
