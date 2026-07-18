# Function: applyHeadToDocument()

```ts
function applyHeadToDocument(document, head): void;
```

Reconcile a HeadContext against the live document head (client-side rendering).

Title, description, metas, links, styles, scripts, JSON-LD and `<html>`/`<body>` attributes
are all applied. Existing Stone-managed nodes are updated in place; new ones are created and
tagged with [STONE\_HEAD\_ATTR](../variables/STONE_HEAD_ATTR.md).

## Parameters

### document

`Document`

The target document.

### head

`HeadContext`

The head context to apply.

## Returns

`void`
