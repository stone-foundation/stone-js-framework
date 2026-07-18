# Interface: AwsLambdaOptions

Configuration options for the `AwsLambda` decorator.
These options extend the default AWS Lambda adapter configuration.

## Extends

- `Partial`\<[`AwsLambdaAdapterAdapterConfig`](../../../options/AwsLambdaAdapterBlueprint/interfaces/AwsLambdaAdapterAdapterConfig.md)\>

## Properties

### alias?

```ts
optional alias?: string;
```

The alias name for the adapter.
This is a unique identifier used to reference the adapter.
Optional property.

#### Inherited from

```ts
Partial.alias
```

***

### current?

```ts
optional current?: boolean;
```

The current status identifier for the adapter.
Used to indicate if this adapter instance is active or currently in use.
Optional property.

#### Inherited from

```ts
Partial.current
```

***

### default?

```ts
optional default?: boolean;
```

Defines whether this adapter is the default adapter used by the application.
Optional property.

#### Inherited from

```ts
Partial.default
```

***

### errorHandlers?

```ts
optional errorHandlers?: Record<string, MetaAdapterErrorHandler<AwsLambdaEvent, RawResponse, AwsLambdaContext>>;
```

Error handlers used to manage and report errors that occur within the adapter.
These handlers can be used to customize error handling behavior and logging.

#### Inherited from

```ts
Partial.errorHandlers
```

***

### eventHandlerResolver?

```ts
optional eventHandlerResolver?: AdapterEventHandlerResolver<IncomingEvent, OutgoingResponse>;
```

The event handler resolver used to create instances of the event handler.

#### Inherited from

```ts
Partial.eventHandlerResolver
```

***

### middleware?

```ts
optional middleware?: AdapterMixedPipeType<AdapterContext<AwsLambdaEvent, RawResponse, AwsLambdaContext, IncomingEvent, IncomingEventOptions, OutgoingResponse>, RawResponse>[];
```

The middleware used for processing incoming or outgoing data in the adapter.
Middleware can modify or handle events at different stages of the adapter's lifecycle.

#### Inherited from

```ts
Partial.middleware
```

***

### platform?

```ts
optional platform?: string;
```

The platform identifier for the adapter.
This is used to categorize the adapter based on the environment or technology it supports.

#### Inherited from

```ts
Partial.platform
```

***

### resolver?

```ts
optional resolver?: AdapterResolver;
```

The class type resolver used to create instances of the adapter.

#### Inherited from

```ts
Partial.resolver
```

***

### variant?

```ts
optional variant?: "server" | "browser" | "console";
```

The class type of the adapter.
This is used to identify the category of the adapter.

#### Inherited from

```ts
Partial.variant
```
