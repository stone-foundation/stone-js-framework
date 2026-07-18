# Function: getAvailableStarters()

```ts
function getAvailableStarters(blueprint, context): Promise<ResolvedStarter[]>;
```

Returns every available starter (fetched links + auto-detected packages), memoised on the
blueprint so the questionnaire and the materialisation step never fetch twice.

## Parameters

### blueprint

The application blueprint (get/set).

#### get

\<`T`\>(`key`, `fallback`) => `T`

#### set

(`key`, `value`) => `unknown`

### context

[`StarterFetchContext`](../interfaces/StarterFetchContext.md)

The fetch context.

## Returns

`Promise`\<[`ResolvedStarter`](../interfaces/ResolvedStarter.md)[]\>

The available starters.
