# Type Alias: ErrorPageType\<IncomingEventType, OutgoingResponseType\>

```ts
type ErrorPageType<IncomingEventType, OutgoingResponseType> = 
  | ErrorPageClass<IncomingEventType, OutgoingResponseType>
| FactoryErrorPage<IncomingEventType, OutgoingResponseType>;
```

Represents an error page type.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`ReactIncomingEvent`](ReactIncomingEvent.md)

The type representing the incoming event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type representing the outgoing response.
