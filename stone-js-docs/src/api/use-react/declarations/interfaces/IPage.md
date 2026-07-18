# Interface: IPage\<IncomingEventType, OutgoingResponseType\>

Represents a page.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`ReactIncomingEvent`](../type-aliases/ReactIncomingEvent.md)

The type representing the incoming event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type representing the outgoing response.

## Properties

### handle?

```ts
optional handle: FunctionalEventHandler<IncomingEventType, OutgoingResponseType>;
```

***

### head()?

```ts
optional head: (context) => Promiseable<HeadContext>;
```

#### Parameters

##### context

[`PageHeadContext`](PageHeadContext.md)\<`any`\>

#### Returns

`Promiseable`\<`HeadContext`\>

***

### render()

```ts
render: (context) => ReactNode;
```

#### Parameters

##### context

[`PageRenderContext`](PageRenderContext.md)\<`any`\>

#### Returns

`ReactNode`
