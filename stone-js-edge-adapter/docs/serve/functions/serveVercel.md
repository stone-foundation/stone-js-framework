[**EdgeAdapter**](../../README.md)

***

[EdgeAdapter](../../README.md) / [serve](../README.md) / serveVercel

# Function: serveVercel()

> **serveVercel**(`options?`): [`FetchHandler`](../../declarations/type-aliases/FetchHandler.md)

Vercel Edge Function entry: `export default serveVercel({ modules: [App] })`
(add `export const config = { runtime: 'edge' }`).

## Parameters

### options?

[`EdgeAppOptions`](../../declarations/interfaces/EdgeAppOptions.md) = `{}`

The app to boot.

## Returns

[`FetchHandler`](../../declarations/type-aliases/FetchHandler.md)

A fetch handler.
