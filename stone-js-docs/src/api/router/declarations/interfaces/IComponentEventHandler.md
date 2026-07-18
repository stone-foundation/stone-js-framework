# Interface: IComponentEventHandler\<IncomingEventType, OutgoingResponseType\>

Represents a component event handler.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](IIncomingEvent.md)

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
optional head: (options) => Promiseable<HeadContext>;
```

#### Parameters

##### options

`any`

#### Returns

`Promiseable`\<[`HeadContext`](HeadContext.md)\>

***

### render()

```ts
render: (options) => unknown;
```

#### Parameters

##### options

`any`

#### Returns

`unknown`
