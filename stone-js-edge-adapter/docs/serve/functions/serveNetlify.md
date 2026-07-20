[**EdgeAdapter**](../../README.md)

***

[EdgeAdapter](../../README.md) / [serve](../README.md) / serveNetlify

# Function: serveNetlify()

> **serveNetlify**(`options?`): (`request`, `context?`) => `Promise`\<`Response`\>

Netlify Edge Function entry: `export default serveNetlify({ modules: [App] })`.
Netlify's context is forwarded to the handler's execution context.

## Parameters

### options?

[`EdgeAppOptions`](../../declarations/interfaces/EdgeAppOptions.md) = `{}`

The app to boot.

## Returns

A Netlify edge handler.

(`request`, `context?`) => `Promise`\<`Response`\>
