# Function: useRoute()

```ts
function useRoute(): IRoute | undefined;
```

Access the currently matched route, or `undefined` when none is active.

Reactive on the client: it updates on every SPA navigation (the router's `ROUTED`
event). On the server it reflects the route matched for the current request.

## Returns

[`IRoute`](../../declarations/type-aliases/IRoute.md) \| `undefined`

The current route, or `undefined`.
