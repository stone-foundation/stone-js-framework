# Interface: MatcherOptions\<IncomingEventType, OutgoingResponseType\>

Options for route matchers.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md)

The type representing the incoming HTTP event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type representing the outgoing HTTP response.

## Properties

### event

```ts
event: IncomingEventType;
```

The incoming HTTP event to be matched.

***

### route

```ts
route: Route<IncomingEventType, OutgoingResponseType>;
```

The route definition to match against.
