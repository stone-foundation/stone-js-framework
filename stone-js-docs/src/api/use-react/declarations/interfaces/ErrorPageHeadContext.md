# Interface: ErrorPageHeadContext\<TError, UData\>

React error page head context.

## Extends

- [`PageHeadContext`](PageHeadContext.md)\<`UData`\>

## Type Parameters

### TError

`TError` = `any`

### UData

`UData` = `any`

## Properties

### data?

```ts
optional data: UData;
```

#### Inherited from

[`PageHeadContext`](PageHeadContext.md).[`data`](PageHeadContext.md#data)

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

[`PageHeadContext`](PageHeadContext.md).[`event`](PageHeadContext.md#event)

***

### statusCode?

```ts
optional statusCode: number;
```

#### Inherited from

[`PageHeadContext`](PageHeadContext.md).[`statusCode`](PageHeadContext.md#statuscode)
