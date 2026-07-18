# Interface: StoneCliBlueprint

Blueprint configuration for the Stone CLI application.

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
stone: StoneCliAppConfig;
```

Application-level settings, including environment, middleware, logging, and service registration.

#### Overrides

```ts
StoneBlueprint.stone
```
