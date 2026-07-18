# Type Alias: DecoratorGroupRouteDefinition\<IncomingEventType, OutgoingResponseType\>

```ts
type DecoratorGroupRouteDefinition<IncomingEventType, OutgoingResponseType> = Omit<DecoratorRouteDefinition<IncomingEventType, OutgoingResponseType>, "fallback" | "alias" | "methods">;
```

Defines a decorator route group without fallback, alias, or methods.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../interfaces/IIncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` = `unknown`
