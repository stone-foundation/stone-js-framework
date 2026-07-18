# Interface: UseReactBlueprint

Stone.js blueprint for a React-based application.

## Extends

- `StoneBlueprint`\<[`ReactIncomingEvent`](../../../declarations/type-aliases/ReactIncomingEvent.md), [`ReactOutgoingResponse`](../../../declarations/type-aliases/ReactOutgoingResponse.md)\>

## Indexable

```ts
[key: string]: unknown
```

Allow adding any additional custom properties.
The value of the custom properties can be of any type, depending on user requirements.

## Properties

### stone

```ts
stone: UseReactAppConfig;
```

Contains the full application configuration, including middleware,
lifecycle hooks, and React integration settings.

#### Overrides

```ts
StoneBlueprint.stone
```
