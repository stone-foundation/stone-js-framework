# Interface: AdapterMiddlewareOptions

AdapterMiddleware options.

This interface defines the configuration options for marking a class as middleware.

## Properties

### adapterAlias?

```ts
optional adapterAlias: string;
```

The alias name for which the middleware is used.

***

### params?

```ts
optional params: unknown[];
```

The params to pass to the middleware.

***

### platform?

```ts
optional platform: string;
```

The platform name for which the middleware is used.

***

### priority?

```ts
optional priority: number;
```

The execution priority of the middleware.
