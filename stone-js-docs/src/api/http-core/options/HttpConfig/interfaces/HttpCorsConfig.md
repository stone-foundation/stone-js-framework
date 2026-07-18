# Interface: HttpCorsConfig

## Properties

### allowedHeaders

```ts
allowedHeaders: string | string[];
```

The headers that are allowed in CORS requests.

***

### credentials

```ts
credentials: boolean;
```

Whether credentials are allowed in CORS requests.

***

### exposedHeaders

```ts
exposedHeaders: string | string[];
```

The headers that are exposed to the client in CORS responses.

***

### maxAge

```ts
maxAge: null | number;
```

The maximum age for preflight requests.

***

### methods

```ts
methods: string | string[];
```

The allowed methods for CORS requests.

***

### origin

```ts
origin: string | string[];
```

The allowed origins for CORS requests.

***

### preflightStop

```ts
preflightStop: boolean;
```

Whether to stop processing preflight requests.

***

### successStatus

```ts
successStatus: number;
```

The HTTP status code to use for successful preflight requests.
