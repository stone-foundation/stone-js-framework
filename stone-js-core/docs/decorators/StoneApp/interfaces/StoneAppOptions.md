# Interface: StoneAppOptions

StoneApp options.

This interface defines the configuration options for marking a class as the main application entry point.

## Extends

- `Partial`\<[`AppConfig`](../../../options/StoneBlueprint/interfaces/AppConfig.md)\>

## Indexable

```ts
[key: string]: unknown
```

## Properties

### adapter?

```ts
optional adapter?: Partial<AdapterConfig<any, any, any, IncomingEvent, any, OutgoingResponse>>;
```

Current Adapter configurations for the application.
This key allow you to specify the current adapter with the alias key.

#### Inherited from

```ts
Partial.adapter
```

***

### adapters?

```ts
optional adapters?: AdapterConfig<any, any, any, IncomingEvent, any, OutgoingResponse>[];
```

Adapter configurations for the application.
List of all adapters used in the application.

#### Inherited from

```ts
Partial.adapters
```

***

### aliases?

```ts
optional aliases?: Record<string, any>;
```

Class aliases to be registered when the application starts.
These aliases provide shorthand references to commonly used classes.

#### Inherited from

```ts
Partial.aliases
```

***

### blueprint?

```ts
optional blueprint?: BlueprintConfig<IBlueprint, any>;
```

Configuration options for building the application blueprint, including middleware and pipe priorities.

#### Inherited from

[`AppConfig`](../../../options/StoneBlueprint/interfaces/AppConfig.md).[`blueprint`](../../../options/StoneBlueprint/interfaces/AppConfig.md#blueprint)

***

### debug?

```ts
optional debug?: boolean;
```

Determines if the application is in debug mode.
When enabled, detailed error messages with stack traces will be shown.

#### Inherited from

[`AppConfig`](../../../options/StoneBlueprint/interfaces/AppConfig.md).[`debug`](../../../options/StoneBlueprint/interfaces/AppConfig.md#debug)

***

### env?

```ts
optional env?: Environment;
```

The current environment in which the application is running.
Possible values are development, production, and test.

#### Inherited from

[`AppConfig`](../../../options/StoneBlueprint/interfaces/AppConfig.md).[`env`](../../../options/StoneBlueprint/interfaces/AppConfig.md#env)

***

### fallback\_locale?

```ts
optional fallback_locale?: string;
```

The fallback locale used when a translation for the default locale is unavailable.

#### Inherited from

[`AppConfig`](../../../options/StoneBlueprint/interfaces/AppConfig.md).[`fallback_locale`](../../../options/StoneBlueprint/interfaces/AppConfig.md#fallback_locale)

***

### kernel?

```ts
optional kernel?: KernelConfig<IncomingEvent, OutgoingResponse>;
```

Kernel configurations for the application.

#### Inherited from

```ts
Partial.kernel
```

***

### lifecycleHooks?

```ts
optional lifecycleHooks?: LifecycleHookType<IBlueprint, any, any, IncomingEvent, OutgoingResponse>;
```

Lifecycle hooks for the application.
These hooks allow you to run custom code at different stages of the application lifecycle.

#### Inherited from

```ts
Partial.lifecycleHooks
```

***

### listeners?

```ts
optional listeners?: MetaEventListener<any>[];
```

Event listeners to be automatically registered when the application starts.
This allows you to specify functions to listen for specific events.

#### Inherited from

```ts
Partial.listeners
```

***

### liveConfigurations?

```ts
optional liveConfigurations?: MixedConfiguration[];
```

Live configurations are loaded at each request.
By default, configurations are loaded once when the application starts.
This is useful for defining dynamic configurations that do not require a restart to apply changes.

#### Inherited from

```ts
Partial.liveConfigurations
```

***

### locale?

```ts
optional locale?: string;
```

The default locale for the application.

#### Inherited from

[`AppConfig`](../../../options/StoneBlueprint/interfaces/AppConfig.md).[`locale`](../../../options/StoneBlueprint/interfaces/AppConfig.md#locale)

***

### logger?

```ts
optional logger?: LoggerConfig;
```

Logging settings, including the logger instance and error reporting configurations.

#### Inherited from

```ts
Partial.logger
```

***

### middleware?

```ts
optional middleware?: MixedPipe<IncomingEvent, OutgoingResponse>[];
```

Middleware configuration options for specific stages of the application lifecycle.

#### Inherited from

```ts
Partial.middleware
```

***

### name?

```ts
optional name?: string;
```

The name of the application.

#### Inherited from

[`AppConfig`](../../../options/StoneBlueprint/interfaces/AppConfig.md).[`name`](../../../options/StoneBlueprint/interfaces/AppConfig.md#name)

***

### providers?

```ts
optional providers?: MixedServiceProvider[];
```

Service providers to be automatically loaded for each request to the application.

#### Inherited from

```ts
Partial.providers
```

***

### secret?

```ts
optional secret?: string;
```

A secret key used for encryption purposes throughout the application.
This key should be kept secure.

#### Inherited from

[`AppConfig`](../../../options/StoneBlueprint/interfaces/AppConfig.md).[`secret`](../../../options/StoneBlueprint/interfaces/AppConfig.md#secret)

***

### services?

```ts
optional services?: MetaService[];
```

Services to be automatically registered when the application starts.

#### Inherited from

```ts
Partial.services
```

***

### subscribers?

```ts
optional subscribers?: MixedEventSubscriber[];
```

Subscribers to be automatically registered when the application starts.
Subscribers are used for handling and responding to events.

#### Inherited from

```ts
Partial.subscribers
```

***

### timezone?

```ts
optional timezone?: string;
```

The default timezone for the application.

#### Inherited from

[`AppConfig`](../../../options/StoneBlueprint/interfaces/AppConfig.md).[`timezone`](../../../options/StoneBlueprint/interfaces/AppConfig.md#timezone)
