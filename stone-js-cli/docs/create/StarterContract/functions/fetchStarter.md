# Function: fetchStarter()

```ts
function fetchStarter(link, context): Promise<{
  dir: string;
  packageJson: any;
}>;
```

Fetches a starter link to a local directory and returns it with its `package.json`.

## Parameters

### link

`string`

The starter link.

### context

[`StarterFetchContext`](../interfaces/StarterFetchContext.md)

The fetch context.

## Returns

`Promise`\<\{
  `dir`: `string`;
  `packageJson`: `any`;
\}\>

The resolved directory and its package.json.

## Throws

When the link cannot be fetched.
