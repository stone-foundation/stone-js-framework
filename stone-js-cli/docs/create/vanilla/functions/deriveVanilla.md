# Function: deriveVanilla()

```ts
function deriveVanilla(dir): string[];
```

Derives a vanilla-JavaScript version of a directory's TypeScript sources in place:
every `.ts` becomes a sibling `.js` and the original `.ts` is removed.

## Parameters

### dir

`string`

The directory (e.g. the project's `app/`).

## Returns

`string`[]

The paths of the generated `.js` files.
