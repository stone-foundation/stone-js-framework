# Interface: NodeConsoleAdapterConfig

Represents the NodeCli configuration options for the application.

## Extends

- `Partial`\<`AppConfig`\>

## Indexable

```ts
[key: string]: unknown
```

## Properties

### adapter?

```ts
optional adapter: Partial<NodeConsoleAdapterAdapterConfig>;
```

Current Adapter configurations for the application.
This key allow you to specify the current adapter with the alias key.

#### Overrides

```ts
Partial.adapter
```

***

### adapters

```ts
adapters: NodeConsoleAdapterAdapterConfig[];
```

Adapter configurations for the application.
List of all adapters used in the application.

#### Overrides

```ts
Partial.adapters
```
