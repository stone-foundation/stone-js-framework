# Type Alias: DecoratorRouteDefinition\<IncomingEventType, OutgoingResponseType\>

```ts
type DecoratorRouteDefinition<IncomingEventType, OutgoingResponseType> = Omit<RouteDefinition<IncomingEventType, OutgoingResponseType>, "path" | "handler" | "method" | "children">;
```

Defines a route using a decorator.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../interfaces/IIncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` = `unknown`
