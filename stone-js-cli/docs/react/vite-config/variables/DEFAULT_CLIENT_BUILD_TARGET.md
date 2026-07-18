# Variable: DEFAULT\_CLIENT\_BUILD\_TARGET

```ts
const DEFAULT_CLIENT_BUILD_TARGET: "es2018" = 'es2018';
```

The default esbuild output target for client bundles.

ES2018 guarantees no static class blocks, no optional chaining,
no nullish coalescing and no class fields in the final output.
Server (SSR) builds override this with a Node target.
