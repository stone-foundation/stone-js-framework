[**Telemetry**](../../../README.md)

***

[Telemetry](../../../README.md) / [middleware/TelemetryMiddleware](../README.md) / TelemetryMiddleware

# Class: TelemetryMiddleware

Kernel middleware that records one span (and a counter) per processed event.

It stays platform-agnostic: it spans every `IncomingEvent` with its `type`, reads a
`statusCode` off the response only when present, and derives the outcome using the
OpenTelemetry convention (thrown error, or status >= 500 → `error`; otherwise `ok`). This
matters because the kernel turns handler errors into responses rather than re-throwing, so a
failed request surfaces as a 5xx response — not an exception — at the middleware boundary.
Errors that *are* thrown are recorded and re-thrown; telemetry never swallows them.

## Constructors

### Constructor

> **new TelemetryMiddleware**(`dependencies`): `TelemetryMiddleware`

#### Parameters

##### dependencies

Auto-wired container services.

###### telemetry

[`ITelemetry`](../../../declarations/interfaces/ITelemetry.md)

#### Returns

`TelemetryMiddleware`

## Methods

### handle()

> **handle**(`event`, `next`): `Promise`\<`OutgoingResponse`\>

Wraps event handling with a telemetry span.

#### Parameters

##### event

`IncomingEvent`

The incoming event.

##### next

`NextMiddleware`\<`IncomingEvent`, `OutgoingResponse`\>

The next middleware.

#### Returns

`Promise`\<`OutgoingResponse`\>

The outgoing response.
