[**Telemetry**](../../../README.md)

***

[Telemetry](../../../README.md) / [options/TelemetryBlueprint](../README.md) / telemetryBlueprint

# Variable: telemetryBlueprint

> `const` **telemetryBlueprint**: [`TelemetryBlueprint`](../interfaces/TelemetryBlueprint.md)

Opt-in blueprint: import and register it in your app to enable telemetry.

It contributes the telemetry service provider and a kernel middleware that spans every
event. Both `stone.providers` and `stone.kernel.middleware` are arrays, so this merges
with the rest of the app rather than replacing anything.
