---
'@stone-js/mcp-dev': patch
---

Publish the arguments every dev tool reads, so an agent can actually pass them.

No tool declared an `inputSchema`, so each one was advertised as taking no arguments and the MCP
client dropped them before sending. Five handlers read arguments and all five received `{}`:
`stone_search` answered `[]` for every query, making a fully populated knowledge base look empty,
while `stone_concept` and `stone_config` always fell into their "list everything" branch and the
report tools opened issues titled `Bug report` with an empty body. The handlers were right; the
advertised contract was not, and the documentation described the arguments the code never published.

`zod` is now a declared dependency rather than a transitive one, `inputSchema` is typed as a Zod
shape instead of a loose record, and a tool without one is registered with no schema at all rather
than an empty one.
