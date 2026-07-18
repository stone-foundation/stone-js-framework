# Interface: ServerLoaderOptions\<DataType, EventType\>

Options controlling a server loader.

## Type Parameters

### DataType

`DataType` = `unknown`

The data the loader returns.

### EventType

`EventType` = `unknown`

The incoming event type.

## Properties

### fallback?

```ts
optional fallback?: DataType;
```

Value used when the server load fails (and policy is not `client-only`).

***

### onError?

```ts
optional onError?: (error, context) => void;
```

Observe failures (e.g. logging); never throws.

#### Parameters

##### error

`unknown`

##### context

[`ServerLoaderContext`](ServerLoaderContext.md)\<`EventType`\>

#### Returns

`void`

***

### policy?

```ts
optional policy?: ServerLoaderPolicy;
```

Cross-boundary policy. Default `server-first`.
