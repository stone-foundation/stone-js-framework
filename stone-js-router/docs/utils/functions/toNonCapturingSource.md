# Function: toNonCapturingSource()

```ts
function toNonCapturingSource(source): string;
```

Rewrites every capturing group in a regex source as a non-capturing group.

Escapes (`\(`), character classes (`[...]`) and lookaround assertions
(`(?=`, `(?!`, `(?<=`, `(?<!`) are preserved untouched.

## Parameters

### source

`string`

The regex source to transform.

## Returns

`string`

The source with all capturing groups made non-capturing.
