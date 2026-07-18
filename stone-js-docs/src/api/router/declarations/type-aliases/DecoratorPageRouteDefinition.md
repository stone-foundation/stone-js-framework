# Type Alias: DecoratorPageRouteDefinition\<IncomingEventType, OutgoingResponseType\>

```ts
type DecoratorPageRouteDefinition<IncomingEventType, OutgoingResponseType> = Omit<PageRouteDefinition<IncomingEventType, OutgoingResponseType>, "path" | "handler" | "method" | "children">;
```

Defines a page route using a decorator.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../interfaces/IIncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` = `unknown`
