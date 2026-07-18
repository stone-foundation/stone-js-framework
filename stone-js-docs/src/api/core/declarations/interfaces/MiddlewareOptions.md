# Interface: MiddlewareOptions

Middleware options.

This interface defines the configuration options for marking a class as middleware.

## Properties

### alias?

```ts
optional alias: string | string[];
```

The alias of the middleware.

***

### global?

```ts
optional global: boolean;
```

Set as Kernel middleware

***

### params?

```ts
optional params: unknown[];
```

The params to pass to the middleware.

***

### priority?

```ts
optional priority: number;
```

The execution priority of the middleware.

***

### singleton?

```ts
optional singleton: boolean;
```

Whether the middleware should be treated as a singleton.
