# Interface: NodeHttpOptions

Interface for configuring the `NodeHttp` decorator.

This interface extends `NodeHttpAdapterConfig` and allows partial customization
of the Node.js HTTP adapter blueprint configuration.

## Extends

- `Partial`\<[`NodeHttpAdapterAdapterConfig`](../../../options/NodeHttpAdapterBlueprint/interfaces/NodeHttpAdapterAdapterConfig.md)\>

## Properties

### isSsl?

```ts
optional isSsl: boolean;
```

Determines if the server should use SSL.

#### Inherited from

```ts
Partial.isSsl
```

***

### printUrls?

```ts
optional printUrls: boolean;
```

Determines if the server should print the URL when starting.

#### Inherited from

```ts
Partial.printUrls
```

***

### server?

```ts
optional server: NodeServerOptions;
```

Additional server configurations for the Node HTTP server.

#### Inherited from

```ts
Partial.server
```

***

### serverMiddleware?

```ts
optional serverMiddleware: ServerMiddleware[];
```

The platform middleware used for processing platform node HTTP requests and responses.
This middleware is executed before the adapter middleware.
This middleware is lower-level and should be used for platform-specific processing.
You can connect or express like middleware here to process request just before the Stone adapter middleware.

#### Inherited from

```ts
Partial.serverMiddleware
```

***

### url?

```ts
optional url: string;
```

The base URL used by the node http to run the application.

#### Inherited from

```ts
Partial.url
```
