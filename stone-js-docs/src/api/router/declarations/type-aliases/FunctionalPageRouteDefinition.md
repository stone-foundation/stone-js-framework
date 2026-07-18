# Type Alias: FunctionalPageRouteDefinition\<IncomingEventType, OutgoingResponseType\>

```ts
type FunctionalPageRouteDefinition<IncomingEventType, OutgoingResponseType> = Omit<PageRouteDefinition<IncomingEventType, OutgoingResponseType>, "path" | "methods" | "method" | "children">;
```

Defines a functional page route without path, methods, or children.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../interfaces/IIncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` = `unknown`
