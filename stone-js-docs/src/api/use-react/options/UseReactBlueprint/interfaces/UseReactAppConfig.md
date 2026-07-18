# Interface: UseReactAppConfig

Application-level configuration that extends `AppConfig` with React-specific settings.

## Extends

- `Partial`\<`AppConfig`\<[`ReactIncomingEvent`](../../../declarations/type-aliases/ReactIncomingEvent.md), [`ReactOutgoingResponse`](../../../declarations/type-aliases/ReactOutgoingResponse.md)\>\>

## Indexable

```ts
[key: string]: unknown
```

## Properties

### useReact

```ts
useReact: UseReactConfig;
```

React integration settings, extending the base application config.
