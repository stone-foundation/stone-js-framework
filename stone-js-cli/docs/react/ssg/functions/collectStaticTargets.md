# Function: collectStaticTargets()

```ts
function collectStaticTargets(definitions): PrerenderTarget[];
```

Collect the static (parameterless) GET routes to pre-render from the route definitions.

This is what makes SSG zero-config: the routes the app already declares (the same
definitions the router scans for lazy loading) become the pre-render set, so the user
never restates them. A definition contributes every one of its parameterless GET paths
(a route may declare several aliases). Parameterized routes (`:id`, `*`) are skipped:
they need a `getStaticPaths`-style expansion the app supplies, merged in via
[runSsg](runSsg.md)'s `extraTargets`.

## Parameters

### definitions

[`RouteDefinitionLike`](../interfaces/RouteDefinitionLike.md)[]

The build-time route definitions.

## Returns

[`PrerenderTarget`](../interfaces/PrerenderTarget.md)[]

The static prerender targets, de-duplicated by path.
