# Interface: IErrorPage\<IncomingEventType, OutgoingResponseType\>

Represents an error page.

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
optional handle: FunctionalErrorHandler<IncomingEventType, OutgoingResponseType>;
```

***

### head()?

```ts
optional head: (context) => Promiseable<HeadContext>;
```

#### Parameters

##### context

[`ErrorPageHeadContext`](ErrorPageHeadContext.md)\<`any`, `any`\>

#### Returns

`Promiseable`\<`HeadContext`\>

***

### render()

```ts
render: (context) => ReactNode;
```

#### Parameters

##### context

[`ErrorPageRenderContext`](ErrorPageRenderContext.md)\<`any`, `any`\>

#### Returns

`ReactNode`
