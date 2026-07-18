# Interface: LoadOutcome\<DataType\>

The result of [runServerLoader](../functions/runServerLoader.md).

## Type Parameters

### DataType

`DataType` = `unknown`

The loaded data type.

## Properties

### clientFetch

```ts
clientFetch: boolean;
```

Whether the client should (re)fetch after hydration.

***

### data?

```ts
optional data?: DataType;
```

***

### error?

```ts
optional error?: unknown;
```

***

### snapshot

```ts
snapshot: boolean;
```

Whether `data` should be serialized into the SSR snapshot for hydration.

***

### status

```ts
status: LoadStatus;
```
