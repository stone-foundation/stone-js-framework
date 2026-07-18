[**Telemetry**](../../../README.md)

***

[Telemetry](../../../README.md) / [exporters/ConsoleTelemetryExporter](../README.md) / ConsoleTelemetryExporter

# Class: ConsoleTelemetryExporter

The default exporter: prints each record to the console as a single structured line.

It is the zero-config fallback so telemetry is useful out of the box; swap it for an
OpenTelemetry / HTTP / dashboard exporter via `stone.telemetry.exporter`.

## Implements

- [`TelemetryExporter`](../../../declarations/interfaces/TelemetryExporter.md)

## Constructors

### Constructor

> **new ConsoleTelemetryExporter**(`sink?`): `ConsoleTelemetryExporter`

#### Parameters

##### sink?

(`message`) => `void`

The output function.

#### Returns

`ConsoleTelemetryExporter`

## Methods

### export()

> **export**(`record`): `void`

Print a record.

#### Parameters

##### record

[`TelemetryRecord`](../../../declarations/interfaces/TelemetryRecord.md)

The record to export.

#### Returns

`void`

#### Implementation of

[`TelemetryExporter`](../../../declarations/interfaces/TelemetryExporter.md).[`export`](../../../declarations/interfaces/TelemetryExporter.md#export)

***

### create()

> `static` **create**(`sink?`): `ConsoleTelemetryExporter`

Factory.

#### Parameters

##### sink?

(`message`) => `void`

The output function (defaults to `console.log`); injectable for testing.

#### Returns

`ConsoleTelemetryExporter`

A new exporter.
