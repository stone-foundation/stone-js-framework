# Function: useHead()

```ts
function useHead(head): void;
```

Apply a head context (title, metas, links, JSON-LD, …) from within a component.

The head is applied to the live document after paint (client only); during SSR/SSG the
effect never runs, so the head must also be returned from the page's `head()` for the
server-rendered markup. Re-applies whenever `head` changes.

## Parameters

### head

`HeadContext`

The head context to apply.

## Returns

`void`
