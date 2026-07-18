# Function: importModule()

```ts
function importModule<R>(relativePath): Promise<undefined | R>;
```

Asynchronously imports a module given its relative path.

## Type Parameters

### R

`R`

## Parameters

### relativePath

`string`

The relative path to the module to be imported.

## Returns

`Promise`\<`undefined` \| `R`\>

A promise that resolves to the imported module, or null if the import fails.
