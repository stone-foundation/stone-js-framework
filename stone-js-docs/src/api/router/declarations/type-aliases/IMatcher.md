# Type Alias: IMatcher()\<IncomingEventType, OutgoingResponseType\>

```ts
type IMatcher<IncomingEventType, OutgoingResponseType> = (options) => boolean;
```

Defines the structure for route matchers.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](../interfaces/IIncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

## Parameters

### options

[`MatcherOptions`](../../matchers/interfaces/MatcherOptions.md)\<`IncomingEventType`, `OutgoingResponseType`\>

## Returns

`boolean`
