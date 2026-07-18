# Type Alias: ErrorPageClass()\<IncomingEventType, OutgoingResponseType\>

```ts
type ErrorPageClass<IncomingEventType, OutgoingResponseType> = (...args) => IErrorPage<IncomingEventType, OutgoingResponseType>;
```

Represents an error page class.

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

[`IErrorPage`](../interfaces/IErrorPage.md)\<`IncomingEventType`, `OutgoingResponseType`\>
