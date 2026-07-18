# Function: buildAssetAliases()

```ts
function buildAssetAliases(assets?): Record<string, string>;
```

Build Vite `resolve.alias` entries for the configured static-asset aliases.

Each alias maps to an absolute path under `<projectRoot>/<assets.dir>/<subfolder>`.
Pure function (no I/O) so it is easy to unit-test.

## Parameters

### assets?

[`AssetsConfig`](../../../options/BuilderConfig/interfaces/AssetsConfig.md)

The resolved assets configuration.

## Returns

`Record`\<`string`, `string`\>

A record of alias → absolute directory path.
