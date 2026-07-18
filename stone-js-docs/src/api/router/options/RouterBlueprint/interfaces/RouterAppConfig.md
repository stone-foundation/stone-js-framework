# Interface: RouterAppConfig\<IncomingEventType, OutgoingResponseType\>

Extends the base application configuration to include router-specific settings.

## Extends

- `Partial`\<`AppConfig`\<`IncomingEventType`, `OutgoingResponse`\>\>

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`StoneIncomingEvent`](../../../declarations/interfaces/StoneIncomingEvent.md) = [`StoneIncomingEvent`](../../../declarations/interfaces/StoneIncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

## Indexable

```ts
[key: string]: unknown
```

## Properties

### router

```ts
router: Partial<RouterConfig<IncomingEventType, OutgoingResponseType>>;
```

Router-specific configuration.
