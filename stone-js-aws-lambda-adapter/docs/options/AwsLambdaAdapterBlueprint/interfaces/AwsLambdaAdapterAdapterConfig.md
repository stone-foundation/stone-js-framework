# Interface: AwsLambdaAdapterAdapterConfig

Configuration interface for the AWS Lambda Adapter.

Extends the `AdapterConfig` interface from the Stone.js framework and provides
customizable options specific to the AWS Lambda platform. This includes
alias, resolver, middleware, hooks, and various adapter state flags.

## Extends

- `AdapterConfig`\<[`AwsLambdaEvent`](../../../declarations/type-aliases/AwsLambdaEvent.md), [`RawResponse`](../../../declarations/type-aliases/RawResponse.md), [`AwsLambdaContext`](../../../declarations/type-aliases/AwsLambdaContext.md), `IncomingEvent`, `IncomingEventOptions`, `OutgoingResponse`\>

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
AdapterConfig.alias
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
AdapterConfig.current
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
AdapterConfig.default
```

***

### errorHandlers

```ts
errorHandlers: Record<string, MetaAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>>;
```

Error handlers used to manage and report errors that occur within the adapter.
These handlers can be used to customize error handling behavior and logging.

#### Inherited from

```ts
AdapterConfig.errorHandlers
```

***

### eventHandlerResolver

```ts
eventHandlerResolver: AdapterEventHandlerResolver<IncomingEvent, OutgoingResponse>;
```

The event handler resolver used to create instances of the event handler.

#### Inherited from

```ts
AdapterConfig.eventHandlerResolver
```

***

### middleware

```ts
middleware: AdapterMixedPipeType<AdapterContext<AwsLambdaEvent, RawResponse, AwsLambdaContext, IncomingEvent, IncomingEventOptions, OutgoingResponse>, RawResponse>[];
```

The middleware used for processing incoming or outgoing data in the adapter.
Middleware can modify or handle events at different stages of the adapter's lifecycle.

#### Inherited from

```ts
AdapterConfig.middleware
```

***

### platform

```ts
platform: string;
```

The platform identifier for the adapter.
This is used to categorize the adapter based on the environment or technology it supports.

#### Inherited from

```ts
AdapterConfig.platform
```

***

### resolver

```ts
resolver: AdapterResolver;
```

The class type resolver used to create instances of the adapter.

#### Inherited from

```ts
AdapterConfig.resolver
```

***

### variant

```ts
variant: "server" | "browser" | "console";
```

The class type of the adapter.
This is used to identify the category of the adapter.

#### Inherited from

```ts
AdapterConfig.variant
```
