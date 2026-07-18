# Type Alias: RouteDefinitionRedirect()\<IncomingEventType, OutgoingResponseType\>

```ts
type RouteDefinitionRedirect<IncomingEventType, OutgoingResponseType> = (route, event) => Promiseable<string | Record<string, unknown>>;
```

Represents a route definition redirect function.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../interfaces/IIncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

## Parameters

### route

[`Route`](../../Route/classes/Route.md)\<`IncomingEventType`, `OutgoingResponseType`\>

### event

`IncomingEventType`

## Returns

`Promiseable`\<`string` \| `Record`\<`string`, `unknown`\>\>
