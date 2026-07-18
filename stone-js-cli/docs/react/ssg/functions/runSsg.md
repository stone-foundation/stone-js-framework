# Function: runSsg()

```ts
function runSsg(options): Promise<string[]>;
```

Run the full SSG pass: collect targets, render each, write files.

The `render` function is supplied by the build pipeline (it invokes the built SSR app /
use-react's `prerenderPage` for a given path). Rendering runs with bounded concurrency.

## Parameters

### options

Orchestration options.

#### concurrency?

`number`

#### definitions

[`RouteDefinitionLike`](../interfaces/RouteDefinitionLike.md)[]

#### extraTargets?

[`PrerenderTarget`](../interfaces/PrerenderTarget.md)[]

#### outDir?

`string`

#### render

(`target`) => `Promise`\<[`PrerenderResult`](../interfaces/PrerenderResult.md)\>

## Returns

`Promise`\<`string`[]\>

The list of written file paths.
