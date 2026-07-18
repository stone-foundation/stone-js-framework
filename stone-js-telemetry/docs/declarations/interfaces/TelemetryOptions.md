[**Telemetry**](../../README.md)

***

[Telemetry](../../README.md) / [declarations](../README.md) / TelemetryOptions

# Interface: TelemetryOptions

Telemetry configuration (`stone.telemetry.*`).

## Extended by

- [`TelemetryConfig`](../../options/TelemetryBlueprint/interfaces/TelemetryConfig.md)

## Properties

### enabled?

> `optional` **enabled?**: `boolean`

Master switch. Default `true`.

***

### exporter?

> `optional` **exporter?**: [`TelemetryExporter`](TelemetryExporter.md)

The exporter. Defaults to the console exporter.

***

### now?

> `optional` **now?**: () => `number`

Injectable monotonic-ish clock (ms). Defaults to `Date.now`. Mainly for testing.

#### Returns

`number`

***

### serviceName?

> `optional` **serviceName?**: `string`

Service name stamped on every record. Default `stone-app`.
