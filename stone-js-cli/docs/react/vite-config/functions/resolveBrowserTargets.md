# Function: resolveBrowserTargets()

```ts
function resolveBrowserTargets(): string | string[];
```

Resolves the browser targets for Babel.

Reads the application's browserslist configuration (.browserslistrc
or the "browserslist" field in package.json) when present,
and falls back to safe defaults otherwise.

## Returns

`string` \| `string`[]

The browser targets.
