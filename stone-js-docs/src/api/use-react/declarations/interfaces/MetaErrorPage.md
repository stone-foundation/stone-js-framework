# Interface: MetaErrorPage\<IncomingEventType, OutgoingResponseType\>

Represents a meta error page.

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`ReactIncomingEvent`](../type-aliases/ReactIncomingEvent.md)

The type representing the incoming event.

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

The type representing the outgoing response.

## Properties

### error?

```ts
optional error: any;
```

***

### isClass?

```ts
optional isClass: boolean;
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
  | ErrorPageType<IncomingEventType, OutgoingResponseType>
| Laziable<ErrorPageType<IncomingEventType, OutgoingResponseType>>;
```
