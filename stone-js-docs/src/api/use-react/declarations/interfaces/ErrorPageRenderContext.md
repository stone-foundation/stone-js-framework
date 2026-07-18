# Interface: ErrorPageRenderContext\<TError, UData\>

React error page render context.

## Extends

- [`PageRenderContext`](PageRenderContext.md)\<`UData`\>

## Type Parameters

### TError

`TError` = `any`

### UData

`UData` = `any`

## Properties

### container

```ts
container: Container;
```

#### Inherited from

[`PageRenderContext`](PageRenderContext.md).[`container`](PageRenderContext.md#container)

***

### data?

```ts
optional data: UData;
```

#### Inherited from

[`PageRenderContext`](PageRenderContext.md).[`data`](PageRenderContext.md#data)

***

### error

```ts
error: TError;
```

***

### event

```ts
event: ReactIncomingEvent;
```

#### Inherited from

[`PageRenderContext`](PageRenderContext.md).[`event`](PageRenderContext.md#event)

***

### statusCode?

```ts
optional statusCode: number;
```

#### Inherited from

[`PageRenderContext`](PageRenderContext.md).[`statusCode`](PageRenderContext.md#statuscode)
