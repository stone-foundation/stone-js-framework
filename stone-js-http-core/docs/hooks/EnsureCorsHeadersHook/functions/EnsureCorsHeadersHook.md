# Function: EnsureCorsHeadersHook()

```ts
function EnsureCorsHeadersHook(options): Promise<void>;
```

Ensure CORS headers at the "onBuildingRawResponse" stage.

This adapter hook ensures that CORS headers are applied even when the middleware is not executed.
It is useful for scenarios where an error occurs before reaching the middleware chain
or when a request bypasses the intended processing.

## Parameters

### options

`AdapterHookListenerContext`\<[`AdapterContextType`](../type-aliases/AdapterContextType.md)\>

The adapter hook listener context containing the blueprint and context.

## Returns

`Promise`\<`void`\>
