[**FetchAdapter**](../../README.md)

***

[FetchAdapter](../../README.md) / [declarations](../README.md) / FetchEventHandlerFunction

# Type Alias: FetchEventHandlerFunction

> **FetchEventHandlerFunction** = (`request`, `executionContext?`) => `Promise`\<`Response`\>

A Fetch handler function: `(request, executionContext?) => Promise<Response>` — exactly what
Cloudflare Workers, Deno, Bun, Vercel/Netlify Edge expect from `export default { fetch }`.

## Parameters

### request

`Request`

### executionContext?

[`FetchExecutionContext`](FetchExecutionContext.md)

## Returns

`Promise`\<`Response`\>
