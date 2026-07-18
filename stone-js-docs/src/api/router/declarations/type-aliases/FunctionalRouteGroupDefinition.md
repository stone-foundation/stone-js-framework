# Type Alias: FunctionalRouteGroupDefinition\<IncomingEventType, OutgoingResponseType\>

```ts
type FunctionalRouteGroupDefinition<IncomingEventType, OutgoingResponseType> = Omit<FunctionalRouteDefinition<IncomingEventType, OutgoingResponseType>, "handler" | "fallback" | "alias"> & object;
```

Defines a functional route group with a required path.

## Type declaration

### path

```ts
path: string;
```

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../interfaces/IIncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` = `unknown`
