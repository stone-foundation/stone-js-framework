# Function: useStone()

```ts
function useStone(): StoneContextType;
```

Access the full Stone context (container, current event, page data) for the current render.

## Returns

[`StoneContextType`](../../declarations/interfaces/StoneContextType.md)

The Stone context.

## Throws

When called outside a Stone-rendered tree (no provider in scope).
