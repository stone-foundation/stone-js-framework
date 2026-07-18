# Function: hostMatcher()

```ts
function hostMatcher<IncomingEventType, OutgoingResponseType>(options): boolean;
```

Matches the host of an incoming HTTP event against a route's host configuration.

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

`true` if the host matches or if no specific host is configured.

## Example

```typescript
const match = hostMatcher({ route, event });
console.log(match); // true or false
```
