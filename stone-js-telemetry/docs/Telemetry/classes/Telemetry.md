[**Telemetry**](../../README.md)

***

[Telemetry](../../README.md) / [Telemetry](../README.md) / Telemetry

# Class: Telemetry

The telemetry collector.

Creates spans/counters/gauges and hands the resulting [TelemetryRecord](../../declarations/interfaces/TelemetryRecord.md)s to a pluggable
exporter. Platform-agnostic: it knows nothing about HTTP/CLI/etc.; callers attach whatever
attributes make sense. When disabled, every operation is a cheap no-op.

## Implements

- [`ITelemetry`](../../declarations/interfaces/ITelemetry.md)

## Constructors

### Constructor

> **new Telemetry**(`options?`): `Telemetry`

#### Parameters

##### options?

[`TelemetryOptions`](../../declarations/interfaces/TelemetryOptions.md) = `{}`

Telemetry options.

#### Returns

`Telemetry`

## Methods

### counter()

> **counter**(`name`, `value?`, `attributes?`): `void`

Emits a counter increment.

#### Parameters

##### name

`string`

Counter name.

##### value?

`number` = `1`

Increment (default `1`).

##### attributes?

`Record`\<`string`, `unknown`\> = `{}`

Attributes.

#### Returns

`void`

#### Implementation of

[`ITelemetry`](../../declarations/interfaces/ITelemetry.md).[`counter`](../../declarations/interfaces/ITelemetry.md#counter)

***

### flush()

> **flush**(): `Promise`\<`void`\>

Flushes the underlying exporter.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ITelemetry`](../../declarations/interfaces/ITelemetry.md).[`flush`](../../declarations/interfaces/ITelemetry.md#flush)

***

### gauge()

> **gauge**(`name`, `value`, `attributes?`): `void`

Emits a gauge value.

#### Parameters

##### name

`string`

Gauge name.

##### value

`number`

Value.

##### attributes?

`Record`\<`string`, `unknown`\> = `{}`

Attributes.

#### Returns

`void`

#### Implementation of

[`ITelemetry`](../../declarations/interfaces/ITelemetry.md).[`gauge`](../../declarations/interfaces/ITelemetry.md#gauge)

***

### isEnabled()

> **isEnabled**(): `boolean`

#### Returns

`boolean`

Whether telemetry is active.

#### Implementation of

[`ITelemetry`](../../declarations/interfaces/ITelemetry.md).[`isEnabled`](../../declarations/interfaces/ITelemetry.md#isenabled)

***

### startSpan()

> **startSpan**(`name`, `attributes?`): [`TelemetrySpan`](../../declarations/interfaces/TelemetrySpan.md)

Starts a span. When disabled, returns a no-op span so call sites stay branch-free.

#### Parameters

##### name

`string`

Span name.

##### attributes?

`Record`\<`string`, `unknown`\> = `{}`

Initial attributes.

#### Returns

[`TelemetrySpan`](../../declarations/interfaces/TelemetrySpan.md)

The span.

#### Implementation of

[`ITelemetry`](../../declarations/interfaces/ITelemetry.md).[`startSpan`](../../declarations/interfaces/ITelemetry.md#startspan)

***

### create()

> `static` **create**(`options?`): `Telemetry`

Factory.

#### Parameters

##### options?

[`TelemetryOptions`](../../declarations/interfaces/TelemetryOptions.md) = `{}`

Telemetry options.

#### Returns

`Telemetry`

A new Telemetry instance.
