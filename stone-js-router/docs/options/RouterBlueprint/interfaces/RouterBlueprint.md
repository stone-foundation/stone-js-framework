# Interface: RouterBlueprint\<IncomingEventType, OutgoingResponseType\>

Blueprint for defining router-specific behavior and configuration.

## Extends

- `StoneBlueprint`\<`IncomingEventType`, `OutgoingResponse`\>

## Type Parameters

### IncomingEventType

`IncomingEventType` *extends* [`StoneIncomingEvent`](../../../declarations/interfaces/StoneIncomingEvent.md) = [`StoneIncomingEvent`](../../../declarations/interfaces/StoneIncomingEvent.md)

### OutgoingResponseType

`OutgoingResponseType` = `unknown`

## Indexable

```ts
[key: string]: unknown
```

Allow adding any additional custom properties.
The value of the custom properties can be of any type, depending on user requirements.

## Properties

### stone

```ts
stone: RouterAppConfig<IncomingEventType, OutgoingResponseType>;
```

Configuration and behavior definitions for the router application.

#### Overrides

```ts
StoneBlueprint.stone
```
