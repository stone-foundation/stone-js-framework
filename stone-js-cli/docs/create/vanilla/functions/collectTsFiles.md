# Function: collectTsFiles()

```ts
function collectTsFiles(dir): string[];
```

Recursively collects the `.ts` files under a directory (skips `.d.ts`).

## Parameters

### dir

`string`

The directory to walk.

## Returns

`string`[]

The absolute `.ts` file paths.
