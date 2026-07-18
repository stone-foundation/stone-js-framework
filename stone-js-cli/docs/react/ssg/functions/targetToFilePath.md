# Function: targetToFilePath()

```ts
function targetToFilePath(routePath, outDir?): string;
```

Map a route path to its output HTML file path.

`/` → `<out>/index.html`; `/blog/hello` → `<out>/blog/hello/index.html` (clean URLs).

## Parameters

### routePath

`string`

The route path.

### outDir?

`string` = `...`

The output directory (defaults to `dist/`).

## Returns

`string`

The absolute file path.
