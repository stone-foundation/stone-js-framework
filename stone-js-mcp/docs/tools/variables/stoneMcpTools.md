[**Mcp**](../../README.md)

***

[Mcp](../../README.md) / [tools](../README.md) / stoneMcpTools

# Variable: stoneMcpTools

> `const` **stoneMcpTools**: [`McpToolDef`](../../declarations/interfaces/McpToolDef.md)[]

The Stone.js framework tools, ready to plug into `@stone-js/mcp-adapter`:

```ts
import { stoneMcpTools } from '@stone-js/mcp'
import { defineMcpTools } from '@stone-js/mcp-adapter'
export const Tools = defineMcpTools(stoneMcpTools)
```

Point your coding agent at the resulting MCP server and it can query the framework in real time
— concepts, modules, best-practices, gaps — instead of scanning every package.
