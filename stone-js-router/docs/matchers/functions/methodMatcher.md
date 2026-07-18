# Function: methodMatcher()

```ts
function methodMatcher<IncomingEventType, OutgoingResponseType>(options): boolean;
```

Matches the HTTP method of an incoming HTTP event against a route's method configuration.

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

`true` if the method matches, otherwise `false`.

## Example

```typescript
const match = methodMatcher({ route, event });
console.log(match); // true or false
```
