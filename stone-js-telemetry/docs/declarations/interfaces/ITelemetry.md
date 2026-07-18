[**Telemetry**](../../README.md)

***

[Telemetry](../../README.md) / [declarations](../README.md) / ITelemetry

# Interface: ITelemetry

The telemetry service contract.

## Properties

### counter

> **counter**: (`name`, `value?`, `attributes?`) => `void`

Emit a counter increment (default `1`).

#### Parameters

##### name

`string`

##### value?

`number`

##### attributes?

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### flush

> **flush**: () => `Promise`\<`void`\>

Flush the exporter.

#### Returns

`Promise`\<`void`\>

***

### gauge

> **gauge**: (`name`, `value`, `attributes?`) => `void`

Emit a gauge value.

#### Parameters

##### name

`string`

##### value

`number`

##### attributes?

`Record`\<`string`, `unknown`\>

#### Returns

`void`

***

### isEnabled

> **isEnabled**: () => `boolean`

Whether telemetry is active.

#### Returns

`boolean`

***

### startSpan

> **startSpan**: (`name`, `attributes?`) => [`TelemetrySpan`](TelemetrySpan.md)

Start a span.

#### Parameters

##### name

`string`

##### attributes?

`Record`\<`string`, `unknown`\>

#### Returns

[`TelemetrySpan`](TelemetrySpan.md)
