# Type Alias: ServerLoaderPolicy

```ts
type ServerLoaderPolicy = "server-first" | "server-only" | "client-only";
```

How a loader behaves across the SSR/CSR boundary.

- `server-first` : run on the server; on failure, defer to a client fetch (or fallback).
- `server-only`  : run only on the server; on failure, use the fallback or give up (never client).
- `client-only`  : never run on the server (needs the browser); always fetched on the client.
