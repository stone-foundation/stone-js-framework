[**Telemetry**](../../README.md)

***

[Telemetry](../../README.md) / [declarations](../README.md) / TelemetrySpan

# Interface: TelemetrySpan

A running span. Call [TelemetrySpan.end](#end) to emit it.

## Properties

### end

> **end**: (`status?`) => `void`

Finish the span and export it. Safe to call once; further calls are ignored.

#### Parameters

##### status?

[`TelemetryStatus`](../type-aliases/TelemetryStatus.md)

#### Returns

`void`

***

### recordError

> **recordError**: (`error`) => `TelemetrySpan`

Record an error on the span (sets status to `error`).

#### Parameters

##### error

`Error`

#### Returns

`TelemetrySpan`

***

### setAttribute

> **setAttribute**: (`key`, `value`) => `TelemetrySpan`

Add one attribute.

#### Parameters

##### key

`string`

##### value

`unknown`

#### Returns

`TelemetrySpan`

***

### setAttributes

> **setAttributes**: (`attributes`) => `TelemetrySpan`

Merge several attributes.

#### Parameters

##### attributes

`Record`\<`string`, `unknown`\>

#### Returns

`TelemetrySpan`
