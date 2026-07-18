# Type Alias: PageClass()\<IncomingEventType, OutgoingResponseType\>

```ts
type PageClass<IncomingEventType, OutgoingResponseType> = (...args) => IPage<IncomingEventType, OutgoingResponseType>;
```

Represents a page class.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`ReactIncomingEvent`](ReactIncomingEvent.md)

The type representing the incoming event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type representing the outgoing response.

## Parameters

### args

...`any`[]

## Returns

[`IPage`](../interfaces/IPage.md)\<`IncomingEventType`, `OutgoingResponseType`\>
