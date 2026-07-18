# Class: Kernel\<IncomingEventType, OutgoingResponseType\>

Class representing a Kernel.

The Kernel class is responsible for managing the main lifecycle of the application, including middleware
registration and provider management. It manages the initialization, registration, and booting of the
components required for a fully functional application.

## Author

Mr. Stone <evensstone@gmail.com>

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` *extends* [`OutgoingResponse`](../../events/OutgoingResponse/classes/OutgoingResponse.md)

## Implements

- [`ILifecycleAdapterEventHandler`](../../declarations/interfaces/ILifecycleAdapterEventHandler.md)\<`IncomingEventType`, `OutgoingResponseType`\>

## Methods

### handle()

```ts
handle(event): Promise<OutgoingResponseType>;
```

Handle Stone IncomingEvent.

#### Parameters

##### event

`IncomingEventType`

The Stone incoming event to handle.

#### Returns

`Promise`\<`OutgoingResponseType`\>

The Stone outgoing response.

#### Implementation of

```ts
ILifecycleAdapterEventHandler.handle
```

***

### onEventHandled()

```ts
onEventHandled(): Promise<void>;
```

Invoke subsequent hooks after handling the event.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ILifecycleAdapterEventHandler`](../../declarations/interfaces/ILifecycleAdapterEventHandler.md).[`onEventHandled`](../../declarations/interfaces/ILifecycleAdapterEventHandler.md#oneventhandled)

***

### onHandlingEvent()

```ts
onHandlingEvent(): Promise<void>;
```

Boot the providers.
Invoke subsequent hooks.
Note: Execution order is important here, never change it.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ILifecycleAdapterEventHandler`](../../declarations/interfaces/ILifecycleAdapterEventHandler.md).[`onHandlingEvent`](../../declarations/interfaces/ILifecycleAdapterEventHandler.md#onhandlingevent)

***

### onInit()

```ts
onInit(): Promise<void>;
```

Populate the context with the given bindings.
The context here is the service container.
Invoke subsequent hooks.
Note: Execution order is important here, never change it.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ILifecycleAdapterEventHandler`](../../declarations/interfaces/ILifecycleAdapterEventHandler.md).[`onInit`](../../declarations/interfaces/ILifecycleAdapterEventHandler.md#oninit)

***

### onTerminate()

```ts
onTerminate(): Promise<void>;
```

Invoke subsequent hooks on termination.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`ILifecycleAdapterEventHandler`](../../declarations/interfaces/ILifecycleAdapterEventHandler.md).[`onTerminate`](../../declarations/interfaces/ILifecycleAdapterEventHandler.md#onterminate)

***

### create()

```ts
static create<IncomingEventType, OutgoingResponseType>(options): Kernel<IncomingEventType, OutgoingResponseType>;
```

Create a Kernel.

#### Type Parameters

##### IncomingEventType

`IncomingEventType` *extends* [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md)

##### OutgoingResponseType

`OutgoingResponseType` *extends* [`OutgoingResponse`](../../events/OutgoingResponse/classes/OutgoingResponse.md)

#### Parameters

##### options

[`KernelOptions`](../interfaces/KernelOptions.md)

Kernel configuration options.

#### Returns

`Kernel`\<`IncomingEventType`, `OutgoingResponseType`\>

A new Kernel instance.
