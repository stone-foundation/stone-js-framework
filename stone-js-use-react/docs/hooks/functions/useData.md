# Function: useData()

```ts
function useData<TData>(): TData | undefined;
```

Access the data produced by the page's `handle()` (its loader).

## Type Parameters

### TData

`TData` = `unknown`

The shape returned by the page loader.

## Returns

`TData` \| `undefined`

The page data, or `undefined` when the page has no loader.
