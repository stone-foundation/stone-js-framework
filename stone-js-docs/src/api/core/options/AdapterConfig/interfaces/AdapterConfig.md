# Interface: AdapterConfig\<RawEventType, RawResponseType, ExecutionContextType, IncomingEventType, IncomingEventOptionsType, OutgoingResponseType\>

AdapterConfig Interface.

This interface defines the configuration options for an adapter within the Stone.js framework.
It includes settings for the adapter's alias, resolver, middleware, and hooks, among other properties.
The AdapterConfig allows developers to manage how the adapter behaves and how it integrates with the application.

## Type Parameters

### RawEventType

`RawEventType` = `any`

### RawResponseType

`RawResponseType` = `any`

### ExecutionContextType

`ExecutionContextType` = `any`

### IncomingEventType

`IncomingEventType` *extends* [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md) = [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md)

### IncomingEventOptionsType

`IncomingEventOptionsType` *extends* [`IncomingEventOptions`](../../../events/IncomingEvent/interfaces/IncomingEventOptions.md) = [`IncomingEventOptions`](../../../events/IncomingEvent/interfaces/IncomingEventOptions.md)

### OutgoingResponseType

`OutgoingResponseType` *extends* [`OutgoingResponse`](../../../events/OutgoingResponse/classes/OutgoingResponse.md) = [`OutgoingResponse`](../../../events/OutgoingResponse/classes/OutgoingResponse.md)

## Properties

### alias?

```ts
optional alias: string;
```

The alias name for the adapter.
This is a unique identifier used to reference the adapter.
Optional property.

***

### current?

```ts
optional current: boolean;
```

The current status identifier for the adapter.
Used to indicate if this adapter instance is active or currently in use.
Optional property.

***

### default?

```ts
optional default: boolean;
```

Defines whether this adapter is the default adapter used by the application.
Optional property.

***

### errorHandlers

```ts
errorHandlers: Record<string, MetaAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>>;
```

Error handlers used to manage and report errors that occur within the adapter.
These handlers can be used to customize error handling behavior and logging.

***

### eventHandlerResolver

```ts
eventHandlerResolver: AdapterEventHandlerResolver<IncomingEventType, OutgoingResponseType>;
```

The event handler resolver used to create instances of the event handler.

***

### middleware

```ts
middleware: AdapterMixedPipeType<AdapterContext<RawEventType, RawResponseType, ExecutionContextType, IncomingEventType, IncomingEventOptionsType, OutgoingResponseType>, RawResponseType>[];
```

The middleware used for processing incoming or outgoing data in the adapter.
Middleware can modify or handle events at different stages of the adapter's lifecycle.

***

### platform

```ts
platform: string;
```

The platform identifier for the adapter.
This is used to categorize the adapter based on the environment or technology it supports.

***

### resolver

```ts
resolver: AdapterResolver;
```

The class type resolver used to create instances of the adapter.

***

### variant

```ts
variant: "server" | "browser" | "console";
```

The class type of the adapter.
This is used to identify the category of the adapter.
