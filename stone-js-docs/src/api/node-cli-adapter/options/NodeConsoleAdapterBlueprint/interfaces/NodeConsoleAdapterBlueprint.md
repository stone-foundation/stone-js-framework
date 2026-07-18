# Interface: NodeConsoleAdapterBlueprint

Blueprint interface for the Node Cli Adapter.

This interface extends `StoneBlueprint` and defines the structure of the
Node Cli adapter blueprint used in the Stone.js framework. It includes
a `stone` object with an array of `NodeCliAdapterConfig` items.

## Extends

- `StoneBlueprint`

## Indexable

```ts
[key: string]: unknown
```

Allow adding any additional custom properties.
The value of the custom properties can be of any type, depending on user requirements.

## Properties

### stone

```ts
stone: Partial<NodeConsoleAdapterConfig>;
```

Application-level settings, including environment, middleware, logging, and service registration.

#### Overrides

```ts
StoneBlueprint.stone
```
