# Function: collectStaticTargets()

```ts
function collectStaticTargets(definitions): PrerenderTarget[];
```

Collect the static (parameterless) GET routes to pre-render from the route definitions.

Parameterized routes (`:id`, `*`) are skipped here: they require a `getStaticPaths`-style
expansion supplied by the app, which the caller merges in via [runSsg](runSsg.md)'s `extraTargets`.

## Parameters

### definitions

[`RouteDefinitionLike`](../interfaces/RouteDefinitionLike.md)[]

The build-time route definitions.

## Returns

[`PrerenderTarget`](../interfaces/PrerenderTarget.md)[]

The static prerender targets.
