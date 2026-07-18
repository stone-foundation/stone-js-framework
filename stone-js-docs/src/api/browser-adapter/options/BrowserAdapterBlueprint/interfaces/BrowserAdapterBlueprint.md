# Interface: BrowserAdapterBlueprint

Blueprint interface for the Browser Adapter.

This interface extends `StoneBlueprint` and defines the structure of the
Browser adapter blueprint used in the Stone.js framework. It includes
a `stone` object with an array of `BrowserAdapterConfig` items.

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
stone: BrowserAdapterConfig;
```

Application-level settings, including environment, middleware, logging, and service registration.

#### Overrides

```ts
StoneBlueprint.stone
```
