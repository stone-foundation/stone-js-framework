[**Telemetry**](../../../README.md)

***

[Telemetry](../../../README.md) / [options/TelemetryBlueprint](../README.md) / TelemetryAppConfig

# Interface: TelemetryAppConfig

Application config augmented with the telemetry bucket.

## Extends

- `Partial`\<`AppConfig`\>

## Indexable

> \[`key`: `string`\]: `unknown`

## Properties

### adapter?

> `optional` **adapter?**: `Partial`\<`AdapterConfig`\<`any`, `any`, `any`, `IncomingEvent`, `any`, `OutgoingResponse`\>\>

Current Adapter configurations for the application.
This key allow you to specify the current adapter with the alias key.

#### Inherited from

`Partial.adapter`

***

### adapters?

> `optional` **adapters?**: `AdapterConfig`\<`any`, `any`, `any`, `IncomingEvent`, `any`, `OutgoingResponse`\>[]

Adapter configurations for the application.
List of all adapters used in the application.

#### Inherited from

`Partial.adapters`

***

### aliases?

> `optional` **aliases?**: `Record`\<`string`, `any`\>

Class aliases to be registered when the application starts.
These aliases provide shorthand references to commonly used classes.

#### Inherited from

`Partial.aliases`

***

### blueprint?

> `optional` **blueprint?**: `BlueprintConfig`\<`IBlueprint`\<`any`\>, `any`\>

Configuration options for building the application blueprint, including middleware and pipe priorities.

#### Inherited from

`Partial.blueprint`

***

### debug?

> `optional` **debug?**: `boolean`

Determines if the application is in debug mode.
When enabled, detailed error messages with stack traces will be shown.

#### Inherited from

`Partial.debug`

***

### env?

> `optional` **env?**: `Environment`

The current environment in which the application is running.
Possible values are development, production, and test.

#### Inherited from

`Partial.env`

***

### fallback\_locale?

> `optional` **fallback\_locale?**: `string`

The fallback locale used when a translation for the default locale is unavailable.

#### Inherited from

`Partial.fallback_locale`

***

### kernel?

> `optional` **kernel?**: `KernelConfig`\<`IncomingEvent`, `OutgoingResponse`\>

Kernel configurations for the application.

#### Inherited from

`Partial.kernel`

***

### lifecycleHooks?

> `optional` **lifecycleHooks?**: `LifecycleHookType`\<`IBlueprint`\<`any`\>, `any`, `any`, `IncomingEvent`, `OutgoingResponse`\>

Lifecycle hooks for the application.
These hooks allow you to run custom code at different stages of the application lifecycle.

#### Inherited from

`Partial.lifecycleHooks`

***

### listeners?

> `optional` **listeners?**: `MetaEventListener`\<`any`\>[]

Event listeners to be automatically registered when the application starts.
This allows you to specify functions to listen for specific events.

#### Inherited from

`Partial.listeners`

***

### liveConfigurations?

> `optional` **liveConfigurations?**: `MixedConfiguration`\<`any`\>[]

Live configurations are loaded at each request.
By default, configurations are loaded once when the application starts.
This is useful for defining dynamic configurations that do not require a restart to apply changes.

#### Inherited from

`Partial.liveConfigurations`

***

### locale?

> `optional` **locale?**: `string`

The default locale for the application.

#### Inherited from

`Partial.locale`

***

### logger?

> `optional` **logger?**: `LoggerConfig`

Logging settings, including the logger instance and error reporting configurations.

#### Inherited from

`Partial.logger`

***

### middleware?

> `optional` **middleware?**: `MixedPipe`\<`IncomingEvent`, `OutgoingResponse`\>[]

Middleware configuration options for specific stages of the application lifecycle.

#### Inherited from

`Partial.middleware`

***

### name?

> `optional` **name?**: `string`

The name of the application.

#### Inherited from

`Partial.name`

***

### providers?

> `optional` **providers?**: `MixedServiceProvider`[]

Service providers to be automatically loaded for each request to the application.

#### Inherited from

`Partial.providers`

***

### secret?

> `optional` **secret?**: `string`

A secret key used for encryption purposes throughout the application.
This key should be kept secure.

#### Inherited from

`Partial.secret`

***

### services?

> `optional` **services?**: `MetaService`[]

Services to be automatically registered when the application starts.

#### Inherited from

`Partial.services`

***

### subscribers?

> `optional` **subscribers?**: `MixedEventSubscriber`[]

Subscribers to be automatically registered when the application starts.
Subscribers are used for handling and responding to events.

#### Inherited from

`Partial.subscribers`

***

### telemetry

> **telemetry**: [`TelemetryConfig`](TelemetryConfig.md)

***

### timezone?

> `optional` **timezone?**: `string`

The default timezone for the application.

#### Inherited from

`Partial.timezone`
