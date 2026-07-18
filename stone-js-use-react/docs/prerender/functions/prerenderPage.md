# Function: prerenderPage()

```ts
function prerenderPage(options): Promise<PrerenderResult>;
```

Pre-render a single page to a full HTML document.

## Parameters

### options

[`PrerenderPageOptions`](../interfaces/PrerenderPageOptions.md)

The prerender options.

## Returns

`Promise`\<[`PrerenderResult`](../../loader/interfaces/PrerenderResult.md)\>

A [PrerenderResult](../../loader/interfaces/PrerenderResult.md) the CLI can write to disk.
