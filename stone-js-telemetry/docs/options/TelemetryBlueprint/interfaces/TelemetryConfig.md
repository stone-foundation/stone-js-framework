[**Telemetry**](../../../README.md)

***

[Telemetry](../../../README.md) / [options/TelemetryBlueprint](../README.md) / TelemetryConfig

# Interface: TelemetryConfig

Telemetry configuration bucket (`stone.telemetry`).

## Extends

- [`TelemetryOptions`](../../../declarations/interfaces/TelemetryOptions.md)

## Properties

### enabled?

> `optional` **enabled?**: `boolean`

Master switch. Default `true`.

#### Inherited from

[`TelemetryOptions`](../../../declarations/interfaces/TelemetryOptions.md).[`enabled`](../../../declarations/interfaces/TelemetryOptions.md#enabled)

***

### exporter?

> `optional` **exporter?**: [`TelemetryExporter`](../../../declarations/interfaces/TelemetryExporter.md)

The exporter. Defaults to the console exporter.

#### Inherited from

[`TelemetryOptions`](../../../declarations/interfaces/TelemetryOptions.md).[`exporter`](../../../declarations/interfaces/TelemetryOptions.md#exporter)

***

### now?

> `optional` **now?**: () => `number`

Injectable monotonic-ish clock (ms). Defaults to `Date.now`. Mainly for testing.

#### Returns

`number`

#### Inherited from

[`TelemetryOptions`](../../../declarations/interfaces/TelemetryOptions.md).[`now`](../../../declarations/interfaces/TelemetryOptions.md#now)

***

### serviceName?

> `optional` **serviceName?**: `string`

Service name stamped on every record. Default `stone-app`.

#### Inherited from

[`TelemetryOptions`](../../../declarations/interfaces/TelemetryOptions.md).[`serviceName`](../../../declarations/interfaces/TelemetryOptions.md#servicename)
