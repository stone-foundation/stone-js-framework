# Function: resolveStarterLinks()

```ts
function resolveStarterLinks(blueprint): string[];
```

Resolves the starter links to use: those given via `--starters` / `stone.createApp.starters`,
otherwise the single built-in default. Passing links never disables the user's other options.

## Parameters

### blueprint

The application blueprint.

#### get

\<`T`\>(`key`, `fallback`) => `T`

## Returns

`string`[]

The starter links.
