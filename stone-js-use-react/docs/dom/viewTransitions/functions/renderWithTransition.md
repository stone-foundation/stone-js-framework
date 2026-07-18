# Function: renderWithTransition()

```ts
function renderWithTransition(
   root, 
   app, 
   options?): void;
```

Renders into a React root, wrapping the update in a View Transition when possible.

A transition is used only when: it is enabled, this is a client navigation (not the first
render), and the browser supports `document.startViewTransition`. The render is flushed
synchronously inside the transition callback so the API can snapshot the new DOM. Otherwise
it falls back to a plain render — so SSR, hydration and unsupported browsers are unaffected.

## Parameters

### root

`Root`

The React root.

### app

`ReactNode`

The React node to render.

### options?

[`RenderWithTransitionOptions`](../interfaces/RenderWithTransitionOptions.md) = `{}`

Transition options.

## Returns

`void`
