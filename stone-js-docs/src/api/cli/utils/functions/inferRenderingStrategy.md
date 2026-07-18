# Function: inferRenderingStrategy()

```ts
function inferRenderingStrategy(content): undefined | "csr" | "ssr";
```

Determines the rendering strategy based on the content of the file.

## Parameters

### content

`string`

The content of the file.

## Returns

`undefined` \| `"csr"` \| `"ssr"`

The rendering strategy: 'csr' or 'ssr'.
