[**Telemetry**](../../README.md)

***

[Telemetry](../../README.md) / [TelemetryServiceProvider](../README.md) / TelemetryServiceProvider

# Class: TelemetryServiceProvider

Registers the [Telemetry](../../Telemetry/classes/Telemetry.md) service (singleton) in the container from `stone.telemetry`
config, aliased as `telemetry`/`Telemetry` so middleware and user code can resolve it.

## Implements

- `IServiceProvider`

## Constructors

### Constructor

> **new TelemetryServiceProvider**(`container`): `TelemetryServiceProvider`

#### Parameters

##### container

`IContainer`

The service container.

#### Returns

`TelemetryServiceProvider`

## Methods

### register()

> **register**(): `Promiseable`\<`void`\>

Register the telemetry service.

#### Returns

`Promiseable`\<`void`\>

#### Implementation of

`IServiceProvider.register`
