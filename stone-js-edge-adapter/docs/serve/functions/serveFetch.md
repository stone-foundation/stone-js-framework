[**EdgeAdapter**](../../README.md)

***

[EdgeAdapter](../../README.md) / [serve](../README.md) / serveFetch

# Function: serveFetch()

> **serveFetch**(`options?`): [`FetchHandler`](../../declarations/type-aliases/FetchHandler.md)

Returns a Web-standard fetch handler that boots the app lazily on the first request (so it works
as a module export). This is the generic target — Vercel Edge and any WinterCG host use it as-is.

## Parameters

### options?

[`EdgeAppOptions`](../../declarations/interfaces/EdgeAppOptions.md) = `{}`

The app to boot.

## Returns

[`FetchHandler`](../../declarations/type-aliases/FetchHandler.md)

A fetch handler.
