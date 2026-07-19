[**EdgeAdapter**](../../README.md)

***

[EdgeAdapter](../../README.md) / [buildFetchHandler](../README.md) / buildFetchHandler

# Function: buildFetchHandler()

> **buildFetchHandler**(`options?`): `Promise`\<[`FetchHandler`](../../declarations/type-aliases/FetchHandler.md)\>

Boots a Stone.js app and returns its Web-standard fetch handler.

This is the foundation the platform `serve*` helpers build on: it runs the real bootstrap via
`StoneFactory` with the Fetch adapter forced current, yielding `(request, executionContext?)
=> Promise<Response>`.

## Parameters

### options?

[`EdgeAppOptions`](../../declarations/interfaces/EdgeAppOptions.md) = `{}`

The modules/blueprint to boot.

## Returns

`Promise`\<[`FetchHandler`](../../declarations/type-aliases/FetchHandler.md)\>

The fetch handler.
