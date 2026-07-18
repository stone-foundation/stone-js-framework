[**Telemetry**](../../README.md)

***

[Telemetry](../../README.md) / [declarations](../README.md) / TelemetryExporter

# Interface: TelemetryExporter

A telemetry exporter. Implement this to ship records anywhere (console, OpenTelemetry,
a metrics endpoint, an in-memory dashboard feed, …).

## Properties

### export

> **export**: (`record`) => `void` \| `Promise`\<`void`\>

Export a single record.

#### Parameters

##### record

[`TelemetryRecord`](TelemetryRecord.md)

#### Returns

`void` \| `Promise`\<`void`\>

***

### flush?

> `optional` **flush?**: () => `void` \| `Promise`\<`void`\>

Optional flush hook, called on shutdown.

#### Returns

`void` \| `Promise`\<`void`\>
