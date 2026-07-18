# Class: RouterServiceProvider\<IncomingEventType, OutgoingResponseType\>

Router Service Provider.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`StoneIncomingEvent`](../../declarations/interfaces/StoneIncomingEvent.md) = [`StoneIncomingEvent`](../../declarations/interfaces/StoneIncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` *extends* `OutgoingResponse` = `OutgoingResponse`

## Implements

- `IServiceProvider`

## Constructors

### Constructor

```ts
new RouterServiceProvider<IncomingEventType, OutgoingResponseType>(container): RouterServiceProvider<IncomingEventType, OutgoingResponseType>;
```

Constructs a new `RouterServiceProvider` instance.

#### Parameters

##### container

`Container`

The container to register the Router service provider with.

#### Returns

`RouterServiceProvider`\<`IncomingEventType`, `OutgoingResponseType`\>

## Methods

### register()

```ts
register(): Promiseable<void>;
```

Register the Router service provider.

#### Returns

`Promiseable`\<`void`\>

#### Implementation of

```ts
IServiceProvider.register
```
