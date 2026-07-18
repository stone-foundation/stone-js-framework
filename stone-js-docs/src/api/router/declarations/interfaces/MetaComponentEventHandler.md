# Interface: MetaComponentEventHandler\<IncomingEventType, OutgoingResponseType\>

Represents a meta component event handler.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`IIncomingEvent`](IIncomingEvent.md)

The type representing the incoming event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type representing the outgoing response.

## Properties

### isClass?

```ts
optional isClass: boolean;
```

***

### isComponent?

```ts
optional isComponent: boolean;
```

***

### isFactory?

```ts
optional isFactory: boolean;
```

***

### layout?

```ts
optional layout: unknown;
```

***

### lazy?

```ts
optional lazy: boolean;
```

***

### module

```ts
module: 
  | ComponentEventHandlerType<IncomingEventType, OutgoingResponseType>
| LazyComponentEventHandler<IncomingEventType, OutgoingResponseType>;
```
