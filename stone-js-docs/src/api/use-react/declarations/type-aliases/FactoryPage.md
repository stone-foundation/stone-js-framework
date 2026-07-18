# Type Alias: FactoryPage()\<IncomingEventType, OutgoingResponseType\>

```ts
type FactoryPage<IncomingEventType, OutgoingResponseType> = (container?) => IPage<IncomingEventType, OutgoingResponseType>;
```

Represents a factory page.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`ReactIncomingEvent`](ReactIncomingEvent.md)

The type representing the incoming event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type representing the outgoing response.

## Parameters

### container?

`IContainer` | `any`

## Returns

[`IPage`](../interfaces/IPage.md)\<`IncomingEventType`, `OutgoingResponseType`\>
