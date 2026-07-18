# Interface: KernelHookType\<IncomingEventType, OutgoingResponseType\>

Hook Type.

Represents a hook that can either be synchronous or asynchronous.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` *extends* [`OutgoingResponse`](../../events/OutgoingResponse/classes/OutgoingResponse.md)

## Properties

### onEventHandled?

```ts
optional onEventHandled: KernelHookListener[];
```

***

### onExecutingErrorHandler?

```ts
optional onExecutingErrorHandler: KernelHookListener[];
```

***

### onExecutingEventHandler?

```ts
optional onExecutingEventHandler: KernelHookListener[];
```

***

### onHandlingEvent?

```ts
optional onHandlingEvent: KernelHookListener[];
```

***

### onInit?

```ts
optional onInit: KernelHookListener[];
```

***

### onKernelMiddlewareProcessed?

```ts
optional onKernelMiddlewareProcessed: PipelineHookListener<IncomingEventType, OutgoingResponseType, any[]>[];
```

***

### onPreparingResponse?

```ts
optional onPreparingResponse: KernelHookListener[];
```

***

### onProcessingKernelMiddleware?

```ts
optional onProcessingKernelMiddleware: PipelineHookListener<IncomingEventType, OutgoingResponseType, any[]>[];
```

***

### onResponsePrepared?

```ts
optional onResponsePrepared: KernelHookListener[];
```

***

### onTerminate?

```ts
optional onTerminate: KernelHookListener[];
```
