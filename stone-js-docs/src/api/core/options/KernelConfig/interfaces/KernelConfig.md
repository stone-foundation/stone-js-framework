# Interface: KernelConfig\<TEvent, UResponse\>

Kernel options.

This interface defines the configuration for kernel-level options.

## Type Parameters

### TEvent

`TEvent` *extends* [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md) = [`IncomingEvent`](../../../events/IncomingEvent/classes/IncomingEvent.md)

### UResponse

`UResponse` *extends* [`OutgoingResponse`](../../../events/OutgoingResponse/classes/OutgoingResponse.md) = [`OutgoingResponse`](../../../events/OutgoingResponse/classes/OutgoingResponse.md)

## Properties

### errorHandlers?

```ts
optional errorHandlers: Record<string, MetaErrorHandler<TEvent, unknown>>;
```

Error handlers used to manage and report errors that occur within the kernel.
These handlers can be used to customize error handling behavior and logging.

***

### eventHandler?

```ts
optional eventHandler: MixedEventHandler<TEvent, unknown>;
```

The main event handler for the application.
Every Stone.js application must have a main event handler.

***

### middleware?

```ts
optional middleware: MixedPipe<TEvent, UResponse>[];
```

Middleware configuration options for different stages of the kernel's lifecycle.

***

### responseResolver?

```ts
optional responseResolver: ResponseResolver<UResponse>;
```

The response resolver, used to create instances of the response object.

***

### skipMiddleware?

```ts
optional skipMiddleware: boolean;
```

A flag indicating whether to skip middleware processing.
This flag can be used to bypass middleware processing in the kernel.
