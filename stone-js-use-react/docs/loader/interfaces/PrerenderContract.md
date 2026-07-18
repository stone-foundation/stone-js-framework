# Interface: PrerenderContract\<EventType\>

Contract for the SSG orchestrator (implemented by the CLI): given the list of targets
and a per-target renderer, produce the pre-rendered results. Kept here so the view layer
and the build tool agree on the shape.

## Type Parameters

### EventType

`EventType` = `unknown`

The incoming event type.

## Properties

### collectTargets

```ts
collectTargets: () => 
  | PrerenderTarget<Record<string, string>>[]
| Promise<PrerenderTarget<Record<string, string>>[]>;
```

Discover the routes to pre-render (static routes + expanded parameterized routes).

#### Returns

  \| [`PrerenderTarget`](PrerenderTarget.md)\<`Record`\<`string`, `string`\>\>[]
  \| `Promise`\<[`PrerenderTarget`](PrerenderTarget.md)\<`Record`\<`string`, `string`\>\>[]\>

***

### renderTarget

```ts
renderTarget: (target, event) => Promise<PrerenderResult>;
```

Render one target to HTML (reuses the SSR path with a synthetic event).

#### Parameters

##### target

[`PrerenderTarget`](PrerenderTarget.md)

##### event

`EventType`

#### Returns

`Promise`\<[`PrerenderResult`](PrerenderResult.md)\>
