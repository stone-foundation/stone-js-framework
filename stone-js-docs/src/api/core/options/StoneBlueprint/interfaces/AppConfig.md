# Interface: AppConfig\<U, V\>

Application settings.

This interface defines the main configuration settings for the Stone.js application,
including general application information, environment settings, adapter configurations,
middleware options, logging settings, and service registration.

## Type Parameters

### U

`U` *extends* [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md) = [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md)

### V

`V` *extends* [`OutgoingResponse`](../../../events/OutgoingResponse/classes/OutgoingResponse.md) = [`OutgoingResponse`](../../../events/OutgoingResponse/classes/OutgoingResponse.md)

## Indexable

```ts
[key: string]: unknown
```

Allow adding any additional custom properties.
The value of the custom properties can be of any type, depending on user requirements.

## Properties

### adapter?

```ts
optional adapter: Partial<AdapterConfig<any, any, any, U, any, V>>;
```

Current Adapter configurations for the application.
This key allow you to specify the current adapter with the alias key.

***

### adapters

```ts
adapters: AdapterConfig<any, any, any, U, any, V>[];
```

Adapter configurations for the application.
List of all adapters used in the application.

***

### aliases

```ts
aliases: Record<string, any>;
```

Class aliases to be registered when the application starts.
These aliases provide shorthand references to commonly used classes.

***

### blueprint

```ts
blueprint: BlueprintConfig<IBlueprint, any>;
```

Configuration options for building the application blueprint, including middleware and pipe priorities.

***

### debug

```ts
debug: boolean;
```

Determines if the application is in debug mode.
When enabled, detailed error messages with stack traces will be shown.

***

### env

```ts
env: Environment;
```

The current environment in which the application is running.
Possible values are development, production, and test.

***

### fallback\_locale

```ts
fallback_locale: string;
```

The fallback locale used when a translation for the default locale is unavailable.

***

### kernel

```ts
kernel: KernelConfig<U, V>;
```

Kernel configurations for the application.

***

### lifecycleHooks?

```ts
optional lifecycleHooks: LifecycleHookType<IBlueprint, any, any, U, V>;
```

Lifecycle hooks for the application.
These hooks allow you to run custom code at different stages of the application lifecycle.

***

### listeners

```ts
listeners: MetaEventListener<any>[];
```

Event listeners to be automatically registered when the application starts.
This allows you to specify functions to listen for specific events.

***

### liveConfigurations?

```ts
optional liveConfigurations: MixedConfiguration[];
```

Live configurations are loaded at each request.
By default, configurations are loaded once when the application starts.
This is useful for defining dynamic configurations that do not require a restart to apply changes.

***

### locale

```ts
locale: string;
```

The default locale for the application.

***

### logger

```ts
logger: LoggerConfig;
```

Logging settings, including the logger instance and error reporting configurations.

***

### name

```ts
name: string;
```

The name of the application.

***

### providers

```ts
providers: MixedServiceProvider[];
```

Service providers to be automatically loaded for each request to the application.

***

### secret?

```ts
optional secret: string;
```

A secret key used for encryption purposes throughout the application.
This key should be kept secure.

***

### services

```ts
services: MetaService[];
```

Services to be automatically registered when the application starts.

***

### subscribers

```ts
subscribers: MixedEventSubscriber[];
```

Subscribers to be automatically registered when the application starts.
Subscribers are used for handling and responding to events.

***

### timezone

```ts
timezone: string;
```

The default timezone for the application.
