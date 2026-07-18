[**Telemetry**](../../README.md)

***

[Telemetry](../../README.md) / [declarations](../README.md) / TelemetryRecord

# Interface: TelemetryRecord

A single, exporter-agnostic telemetry record.

## Properties

### attributes

> **attributes**: `Record`\<`string`, `unknown`\>

Arbitrary key/value attributes.

***

### durationMs?

> `optional` **durationMs?**: `number`

Span duration in milliseconds (spans only).

***

### error?

> `optional` **error?**: `object`

Captured error, if any (spans only).

#### message

> **message**: `string`

#### name

> **name**: `string`

***

### kind

> **kind**: [`TelemetryKind`](../type-aliases/TelemetryKind.md)

Record kind.

***

### name

> **name**: `string`

Metric/span name (e.g. `stone.event`).

***

### service

> **service**: `string`

Owning service name (from config).

***

### status?

> `optional` **status?**: [`TelemetryStatus`](../type-aliases/TelemetryStatus.md)

Span outcome (spans only).

***

### timestamp

> **timestamp**: `number`

Wall-clock timestamp (ms) when the record was emitted.

***

### value?

> `optional` **value?**: `number`

Counter/gauge value.
