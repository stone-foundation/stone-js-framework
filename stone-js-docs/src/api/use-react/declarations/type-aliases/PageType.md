# Type Alias: PageType\<IncomingEventType, OutgoingResponseType\>

```ts
type PageType<IncomingEventType, OutgoingResponseType> = 
  | PageClass<IncomingEventType, OutgoingResponseType>
| FactoryPage<IncomingEventType, OutgoingResponseType>;
```

Represents a page type.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`ReactIncomingEvent`](ReactIncomingEvent.md)

The type representing the incoming event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type representing the outgoing response.
