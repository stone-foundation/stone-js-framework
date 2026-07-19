[**EdgeAdapter**](../../README.md)

***

[EdgeAdapter](../../README.md) / [serve](../README.md) / serveBun

# Function: serveBun()

> **serveBun**(`options?`, `serveOptions?`): `Record`\<`string`, `unknown`\>

Bun entry: `export default serveBun({ modules: [App] })` — a `Bun.serve` compatible object.

## Parameters

### options?

[`EdgeAppOptions`](../../declarations/interfaces/EdgeAppOptions.md) = `{}`

The app to boot.

### serveOptions?

`Record`\<`string`, `unknown`\> = `{}`

Extra `Bun.serve` options (e.g. `port`).

## Returns

`Record`\<`string`, `unknown`\>

A Bun server object with a `fetch` method.
