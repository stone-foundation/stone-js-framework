# Type Alias: LoadStatus

```ts
type LoadStatus = "server-loaded" | "fallback" | "deferred-to-client" | "given-up";
```

The outcome of running a loader — tells the renderer what to do next.

- `server-loaded`      : data is ready, embed it in the SSR snapshot; no client refetch.
- `fallback`           : server load failed, using the fallback value; embed it, no refetch.
- `deferred-to-client` : run/refetch on the client after hydration (nothing in the snapshot).
- `given-up`           : server-only load failed with no fallback; render without the data.
