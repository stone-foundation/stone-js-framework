# Function: uriMatcher()

```ts
function uriMatcher<IncomingEventType, OutgoingResponseType>(options): boolean;
```

Matches the URI of an incoming HTTP event against a route's path configuration.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md) = [`IIncomingEvent`](../../declarations/interfaces/IIncomingEvent.md)

The type representing the incoming HTTP event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type representing the outgoing HTTP response.

## Parameters

### options

[`MatcherOptions`](../interfaces/MatcherOptions.md)\<`IncomingEventType`, `OutgoingResponseType`\>

The matcher options containing the route and event.

## Returns

`boolean`

`true` if the URI matches the route's configuration, otherwise `false`.

## Example

```typescript
const match = uriMatcher({ route, event });
console.log(match); // true or false
```
