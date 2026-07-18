# Interface: MetaConfiguration\<TValues\>

MetaConfiguration Interface.

Represents a metadata object for a configuration.

## Type Parameters

### TValues

`TValues` *extends* `object` = `any`

## Properties

### isClass?

```ts
optional isClass: boolean;
```

***

### module

```ts
module: 
  | ConfigurationClass<TValues>
| FunctionalConfiguration<TValues>;
```
