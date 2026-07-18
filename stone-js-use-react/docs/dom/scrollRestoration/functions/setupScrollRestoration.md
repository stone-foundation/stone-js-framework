# Function: setupScrollRestoration()

```ts
function setupScrollRestoration(options?): () => void;
```

Sets up SPA scroll restoration and returns a teardown function.

Behaviour (standard SPA semantics):
- takes manual control (`history.scrollRestoration = 'manual'`);
- continuously remembers the scroll position of the current history entry;
- on a forward navigation (router `NAVIGATION_EVENT`): scrolls to the URL hash target if any,
  otherwise to the top;
- on back/forward (`popstate`): restores the remembered position, or the top if unknown.

All scroll changes are deferred to the next frame so they run after the (possibly
transitioned) DOM update. No-op outside the browser or when disabled.

## Parameters

### options?

[`ScrollRestorationOptions`](../interfaces/ScrollRestorationOptions.md) = `{}`

Scroll restoration options.

## Returns

A teardown function removing the listeners.

() => `void`
