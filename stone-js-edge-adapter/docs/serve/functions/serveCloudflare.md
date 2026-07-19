[**EdgeAdapter**](../../README.md)

***

[EdgeAdapter](../../README.md) / [serve](../README.md) / serveCloudflare

# Function: serveCloudflare()

> **serveCloudflare**(`options?`): `object`

Cloudflare Workers entry: `export default serveCloudflare({ modules: [App] })`.
The Worker's `env`/`ctx` are forwarded to the handler's execution context.

## Parameters

### options?

[`EdgeAppOptions`](../../declarations/interfaces/EdgeAppOptions.md) = `{}`

The app to boot.

## Returns

`object`

A Cloudflare module worker with a `fetch` method.

### fetch

> **fetch**: (`request`, `env?`, `ctx?`) => `Promise`\<`Response`\>

#### Parameters

##### request

`Request`

##### env?

`unknown`

##### ctx?

`unknown`

#### Returns

`Promise`\<`Response`\>
