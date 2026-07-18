# Class: UseReactEventHandler\<IncomingEventType\>

A useReact event handler for processing incoming events
For single event handler.

Multiple event handlers will be processed by the router.

## Template

The type representing the outgoing response.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`ReactIncomingEvent`](../../declarations/type-aliases/ReactIncomingEvent.md) = [`ReactIncomingEvent`](../../declarations/type-aliases/ReactIncomingEvent.md)

The type representing the incoming event.

## Implements

- `IEventHandler`\<`IncomingEventType`, [`MetaPage`](../../declarations/interfaces/MetaPage.md)\<`IncomingEventType`\>\>

## Constructors

### Constructor

```ts
new UseReactEventHandler<IncomingEventType>(options): UseReactEventHandler<IncomingEventType>;
```

Constructs a `UseReactEventHandler` instance.

#### Parameters

##### options

The UseReactEventHandler options including blueprint.

###### blueprint

`IBlueprint`

#### Returns

`UseReactEventHandler`\<`IncomingEventType`\>

## Methods

### handle()

```ts
handle(): MetaPage<IncomingEventType>;
```

Handle an incoming event.

#### Returns

[`MetaPage`](../../declarations/interfaces/MetaPage.md)\<`IncomingEventType`\>

The outgoing response.

#### Implementation of

```ts
IEventHandler.handle
```
