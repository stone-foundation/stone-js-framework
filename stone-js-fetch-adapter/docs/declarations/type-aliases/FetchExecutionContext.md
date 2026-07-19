[**FetchAdapter**](../../README.md)

***

[FetchAdapter](../../README.md) / [declarations](../README.md) / FetchExecutionContext

# Type Alias: FetchExecutionContext

> **FetchExecutionContext** = `Record`\<`string`, `unknown`\>

The runtime-provided execution context (e.g. Cloudflare `env`/`ctx`, Deno info). Opaque and
optional — the adapter never depends on any particular runtime's shape.
