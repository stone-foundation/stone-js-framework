[**EdgeAdapter**](../../README.md)

***

[EdgeAdapter](../../README.md) / [serve](../README.md) / serveDeno

# Function: serveDeno()

> **serveDeno**(`options?`, `serveOptions?`): `unknown`

Deno entry: `serveDeno({ modules: [App] })` — starts `Deno.serve` immediately.

## Parameters

### options?

[`EdgeAppOptions`](../../declarations/interfaces/EdgeAppOptions.md) = `{}`

The app to boot.

### serveOptions?

`Record`\<`string`, `unknown`\> = `{}`

Extra `Deno.serve` options (e.g. `{ port }`).

## Returns

`unknown`

Whatever `Deno.serve` returns (the server).

## Throws

When not running on Deno.
