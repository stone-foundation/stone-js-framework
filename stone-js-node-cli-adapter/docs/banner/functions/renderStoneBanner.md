# Function: renderStoneBanner()

```ts
function renderStoneBanner(subtitle?): string;
```

Render the Stone.js CLI signature banner:

```
◆ Stone.js
  ───────────────────────────
  The continuum framework
```

Printed by the adapter on every command, to **stderr**, so it never pollutes a command's stdout
(data, JSON, or the MCP protocol). `chalk` applies the ember brand accent when the terminal
supports colour and stays plain otherwise (respecting `NO_COLOR`).

## Parameters

### subtitle?

`string` = `'The continuum framework'`

The tagline under the rule.

## Returns

`string`

The banner string (no trailing newline).
