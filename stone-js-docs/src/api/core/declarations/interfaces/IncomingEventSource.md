# Interface: IncomingEventSource

Represents an IncomingEvent source.

## Properties

### platform

```ts
platform: string | symbol;
```

The platform from which the event originated.

***

### rawContext

```ts
rawContext: unknown;
```

The raw context object from the originating platform.

***

### rawEvent

```ts
rawEvent: unknown;
```

The raw event object from the originating platform.

***

### rawResponse?

```ts
optional rawResponse: unknown;
```

The raw response object from the originating platform.
