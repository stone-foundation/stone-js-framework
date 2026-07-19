[**Testing**](../../README.md)

***

[Testing](../../README.md) / [factories](../README.md) / makeIncomingHttpEvent

# Function: makeIncomingHttpEvent()

> **makeIncomingHttpEvent**(`options?`): `IncomingHttpEvent`

Builds a ready-to-dispatch `IncomingHttpEvent` for tests, with sensible defaults — no more
repeating `IncomingHttpEvent.create({ url: new URL(...) })` in every test.

## Parameters

### options?

[`MakeHttpEventOptions`](../interfaces/MakeHttpEventOptions.md) = `{}`

The event options.

## Returns

`IncomingHttpEvent`

The incoming HTTP event.
