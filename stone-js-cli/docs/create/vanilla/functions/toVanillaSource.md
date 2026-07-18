# Function: toVanillaSource()

```ts
function toVanillaSource(code): string;
```

Transpiles a TypeScript source string to readable vanilla JavaScript.

Types are stripped while TC39 stage-3 decorators are preserved natively (target ESNext,
no `experimentalDecorators`), so the derived JS stays clean and idiomatic — the exact same
declarative or imperative code, just without type annotations. This is how Stone.js offers a
true JavaScript path without maintaining a second set of templates.

## Parameters

### code

`string`

The TypeScript source.

## Returns

`string`

The vanilla JavaScript source.
