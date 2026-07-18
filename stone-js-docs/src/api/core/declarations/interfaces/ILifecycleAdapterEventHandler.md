# Interface: ILifecycleAdapterEventHandler\<TEvent, UResponse\>

ILifecycleAdapterEventHandler Interface.

Represents a lifecycle event handler with hooks for initialization, pre-handling, handling, and termination phases.

## Template

UResponse

## Type Parameters

### TEvent

`TEvent` *extends* [`IncomingEvent`](../../events/IncomingEvent/classes/IncomingEvent.md)

### UResponse

`UResponse` *extends* [`OutgoingResponse`](../../events/OutgoingResponse/classes/OutgoingResponse.md)

## Properties

### handle

```ts
handle: FunctionalAdapterEventHandler<TEvent, UResponse>;
```

***

### onEventHandled()?

```ts
optional onEventHandled: () => Promiseable<void>;
```

#### Returns

[`Promiseable`](../type-aliases/Promiseable.md)\<`void`\>

***

### onHandlingEvent()?

```ts
optional onHandlingEvent: () => Promiseable<void>;
```

#### Returns

[`Promiseable`](../type-aliases/Promiseable.md)\<`void`\>

***

### onInit()?

```ts
optional onInit: () => Promiseable<void>;
```

#### Returns

[`Promiseable`](../type-aliases/Promiseable.md)\<`void`\>

***

### onTerminate()?

```ts
optional onTerminate: () => Promiseable<void>;
```

#### Returns

[`Promiseable`](../type-aliases/Promiseable.md)\<`void`\>
