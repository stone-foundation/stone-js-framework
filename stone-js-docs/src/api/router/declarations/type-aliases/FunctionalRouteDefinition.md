# Type Alias: FunctionalRouteDefinition\<IncomingEventType, OutgoingResponseType\>

```ts
type FunctionalRouteDefinition<IncomingEventType, OutgoingResponseType> = Omit<RouteDefinition<IncomingEventType, OutgoingResponseType>, "path" | "methods" | "method" | "children">;
```

Defines a functional route without path, methods, or children.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../interfaces/IIncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` = `unknown`
