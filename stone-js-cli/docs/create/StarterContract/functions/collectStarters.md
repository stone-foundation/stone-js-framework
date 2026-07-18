# Function: collectStarters()

```ts
function collectStarters(links, context): Promise<ResolvedStarter[]>;
```

Fetches every link and expands each into its declared starter entries.

## Parameters

### links

`string`[]

The starter links.

### context

[`StarterFetchContext`](../interfaces/StarterFetchContext.md)

The fetch context.

## Returns

`Promise`\<[`ResolvedStarter`](../interfaces/ResolvedStarter.md)[]\>

The resolved starters.
