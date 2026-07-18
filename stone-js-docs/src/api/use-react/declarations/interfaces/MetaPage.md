# Interface: MetaPage\<IncomingEventType, OutgoingResponseType\>

Represents a meta page.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`ReactIncomingEvent`](../type-aliases/ReactIncomingEvent.md)

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
  | PageType<IncomingEventType, OutgoingResponseType>
| Laziable<PageType<IncomingEventType, OutgoingResponseType>>;
```
