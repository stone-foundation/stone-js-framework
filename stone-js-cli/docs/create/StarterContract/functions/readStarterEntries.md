# Function: readStarterEntries()

```ts
function readStarterEntries(packageJson): StarterEntry[];
```

Reads the starter entries a package declares in `package.json` -> `stone.starters`.
When none are declared, the whole package is treated as a single starter (path `.`),
so a plain template repo works with zero manifest.

## Parameters

### packageJson

`any`

The package's manifest.

## Returns

[`StarterEntry`](../interfaces/StarterEntry.md)[]

The declared starter entries.
