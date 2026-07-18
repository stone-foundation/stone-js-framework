# Interface: NodeHttpOptions

Interface for configuring the `NodeHttp` decorator.

This interface extends `NodeHttpAdapterConfig` and allows partial customization
of the Node.js HTTP adapter blueprint configuration.

## Extends

- `Partial`\<[`NodeHttpAdapterAdapterConfig`](../../../options/NodeHttpAdapterBlueprint/interfaces/NodeHttpAdapterAdapterConfig.md)\>

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
Partial.alias
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
Partial.current
```

***

### default?

```ts
optional default?: boolean;
```

Defines whether this adapter is the default adapter used by the application.
Optional property.

#### Inherited from

[`NodeHttpAdapterAdapterConfig`](../../../options/NodeHttpAdapterBlueprint/interfaces/NodeHttpAdapterAdapterConfig.md).[`default`](../../../options/NodeHttpAdapterBlueprint/interfaces/NodeHttpAdapterAdapterConfig.md#default)

***

### errorHandlers?

```ts
optional errorHandlers?: Record<string, MetaAdapterErrorHandler<IncomingMessage, ServerResponse<IncomingMessage>, NodeHttpServer>>;
```

Error handlers used to manage and report errors that occur within the adapter.
These handlers can be used to customize error handling behavior and logging.

#### Inherited from

```ts
Partial.errorHandlers
```

***

### eventHandlerResolver?

```ts
optional eventHandlerResolver?: AdapterEventHandlerResolver<IncomingHttpEvent, OutgoingHttpResponse>;
```

The event handler resolver used to create instances of the event handler.

#### Inherited from

```ts
Partial.eventHandlerResolver
```

***

### isSsl?

```ts
optional isSsl?: boolean;
```

Determines if the server should use SSL.

#### Inherited from

[`NodeHttpAdapterAdapterConfig`](../../../options/NodeHttpAdapterBlueprint/interfaces/NodeHttpAdapterAdapterConfig.md).[`isSsl`](../../../options/NodeHttpAdapterBlueprint/interfaces/NodeHttpAdapterAdapterConfig.md#isssl)

***

### middleware?

```ts
optional middleware?: AdapterMixedPipeType<AdapterContext<IncomingMessage, ServerResponse<IncomingMessage>, NodeHttpServer, IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse>, ServerResponse<IncomingMessage>>[];
```

The middleware used for processing incoming or outgoing data in the adapter.
Middleware can modify or handle events at different stages of the adapter's lifecycle.

#### Inherited from

```ts
Partial.middleware
```

***

### platform?

```ts
optional platform?: string;
```

The platform identifier for the adapter.
This is used to categorize the adapter based on the environment or technology it supports.

#### Inherited from

[`NodeHttpAdapterAdapterConfig`](../../../options/NodeHttpAdapterBlueprint/interfaces/NodeHttpAdapterAdapterConfig.md).[`platform`](../../../options/NodeHttpAdapterBlueprint/interfaces/NodeHttpAdapterAdapterConfig.md#platform)

***

### printUrls?

```ts
optional printUrls?: boolean;
```

Determines if the server should print the URL when starting.

#### Inherited from

[`NodeHttpAdapterAdapterConfig`](../../../options/NodeHttpAdapterBlueprint/interfaces/NodeHttpAdapterAdapterConfig.md).[`printUrls`](../../../options/NodeHttpAdapterBlueprint/interfaces/NodeHttpAdapterAdapterConfig.md#printurls)

***

### resolver?

```ts
optional resolver?: AdapterResolver;
```

The class type resolver used to create instances of the adapter.

#### Inherited from

```ts
Partial.resolver
```

***

### server?

```ts
optional server?: NodeServerOptions;
```

Additional server configurations for the Node HTTP server.

#### Inherited from

[`NodeHttpAdapterAdapterConfig`](../../../options/NodeHttpAdapterBlueprint/interfaces/NodeHttpAdapterAdapterConfig.md).[`server`](../../../options/NodeHttpAdapterBlueprint/interfaces/NodeHttpAdapterAdapterConfig.md#server)

***

### serverMiddleware?

```ts
optional serverMiddleware?: ServerMiddleware[];
```

The platform middleware used for processing platform node HTTP requests and responses.
This middleware is executed before the adapter middleware.
This middleware is lower-level and should be used for platform-specific processing.
You can connect or express like middleware here to process request just before the Stone adapter middleware.

#### Inherited from

[`NodeHttpAdapterAdapterConfig`](../../../options/NodeHttpAdapterBlueprint/interfaces/NodeHttpAdapterAdapterConfig.md).[`serverMiddleware`](../../../options/NodeHttpAdapterBlueprint/interfaces/NodeHttpAdapterAdapterConfig.md#servermiddleware)

***

### url?

```ts
optional url?: string;
```

The base URL used by the node http to run the application.

#### Inherited from

[`NodeHttpAdapterAdapterConfig`](../../../options/NodeHttpAdapterBlueprint/interfaces/NodeHttpAdapterAdapterConfig.md).[`url`](../../../options/NodeHttpAdapterBlueprint/interfaces/NodeHttpAdapterAdapterConfig.md#url)

***

### variant?

```ts
optional variant?: "server" | "browser" | "console";
```

The class type of the adapter.
This is used to identify the category of the adapter.

#### Inherited from

```ts
Partial.variant
```
