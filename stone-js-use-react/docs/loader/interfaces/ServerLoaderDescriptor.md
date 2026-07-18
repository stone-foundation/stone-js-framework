# Interface: ServerLoaderDescriptor\<DataType, EventType\>

A normalized server-loader descriptor produced by [defineServerLoader](../functions/defineServerLoader.md).

## Type Parameters

### DataType

`DataType` = `unknown`

### EventType

`EventType` = `unknown`

## Properties

### \_\_serverLoader

```ts
readonly __serverLoader: true;
```

***

### fallback?

```ts
optional fallback?: DataType;
```

***

### load

```ts
load: (context) => DataType | Promise<DataType>;
```

#### Parameters

##### context

[`ServerLoaderContext`](ServerLoaderContext.md)\<`EventType`\>

#### Returns

`DataType` \| `Promise`\<`DataType`\>

***

### onError?

```ts
optional onError?: (error, context) => void;
```

#### Parameters

##### error

`unknown`

##### context

[`ServerLoaderContext`](ServerLoaderContext.md)\<`EventType`\>

#### Returns

`void`

***

### policy

```ts
policy: ServerLoaderPolicy;
```
