[**Telemetry**](../../../README.md)

***

[Telemetry](../../../README.md) / [options/TelemetryBlueprint](../README.md) / TelemetryBlueprint

# Interface: TelemetryBlueprint

Blueprint for the telemetry module.

## Extends

- `StoneBlueprint`

## Indexable

> \[`key`: `string`\]: `unknown`

Allow adding any additional custom properties.
The value of the custom properties can be of any type, depending on user requirements.

## Properties

### stone

> **stone**: [`TelemetryAppConfig`](TelemetryAppConfig.md)

Application-level settings, including environment, middleware, logging, and service registration.

#### Overrides

`StoneBlueprint.stone`
