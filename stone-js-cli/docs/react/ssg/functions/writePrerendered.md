# Function: writePrerendered()

```ts
function writePrerendered(results, outDir?): string[];
```

Write pre-rendered results to disk as `<out>/<route>/index.html`.

## Parameters

### results

[`PrerenderResult`](../interfaces/PrerenderResult.md)[]

The pre-render results.

### outDir?

`string` = `...`

The output directory (defaults to `dist/`).

## Returns

`string`[]

The list of written file paths.
