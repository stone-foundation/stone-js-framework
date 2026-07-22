[**Mcp Dev**](../../README.md)

***

[Mcp Dev](../../README.md) / [llms](../README.md) / generateLlmsTxt

# Function: generateLlmsTxt()

> **generateLlmsTxt**(`base?`): `string`

Generates the concise `llms.txt` index (the emerging standard: a short, link-friendly Markdown
map an agent can read in one shot). Serve it at `/llms.txt` from the docs site.

## Parameters

### base?

[`KnowledgeBase`](../../declarations/interfaces/KnowledgeBase.md) = `knowledgeBase`

The knowledge base (defaults to the built-in one).

## Returns

`string`

The `llms.txt` content.
