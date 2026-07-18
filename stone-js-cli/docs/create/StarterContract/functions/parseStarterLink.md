# Function: parseStarterLink()

```ts
function parseStarterLink(link): object;
```

Parses a starter link into a fetch descriptor.

Supported: `github:owner/repo(#ref)`, any `*.git` / `git@` / `git+` URL, `npm:<pkg>`,
a bare npm package name (`@scope/x`, `x`), or a local path (`./x`, `/x`).

## Parameters

### link

`string`

The starter link.

## Returns

`object`

The parsed descriptor.

### kind

```ts
kind: "git" | "npm" | "local";
```

### ref?

```ts
optional ref?: string;
```

### target

```ts
target: string;
```
