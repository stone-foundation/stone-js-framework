# Function: inferRenderingStrategy()

```ts
function inferRenderingStrategy(content): "csr" | "ssr" | undefined;
```

Determines the rendering strategy based on the content of the file.

## Parameters

### content

`string`

The content of the file.

## Returns

`"csr"` \| `"ssr"` \| `undefined`

The rendering strategy: 'csr' or 'ssr'.
