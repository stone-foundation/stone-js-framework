# Type Alias: FactoryErrorPage()\<IncomingEventType, OutgoingResponseType\>

```ts
type FactoryErrorPage<IncomingEventType, OutgoingResponseType> = (container?) => IErrorPage<IncomingEventType, OutgoingResponseType>;
```

Represents a factory error page.

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

[`IErrorPage`](../interfaces/IErrorPage.md)\<`IncomingEventType`, `OutgoingResponseType`\>
