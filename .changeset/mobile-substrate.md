---
"@stone-js/router": patch
"@stone-js/use-view": patch
"@stone-js/use-react": patch
---

feat(router): navigation becomes an effect the platform provides, not an assumption

`Router.navigate()` was the one place the universal router stopped being universal: it reached
straight for `window.history` and `window.dispatchEvent`, and threw outside a browser. Everything
around it, matching and generating a path from a route name, is platform-independent already.

Only that last step is now delegated, to a `RouterNavigator` under `stone.router.navigator`:

```ts
export type RouterNavigator = (context: NavigationContext) => void
// NavigationContext: { path, replace, options }
```

The router still does the platform-independent work before calling it, so a navigator receives a
resolved path and performs one effect. `browserNavigator` is the fallback when none is configured,
and it is the exact behaviour that was inlined before (push or replace a History entry, then
announce it so the adapter re-enters the kernel), which means **nothing changes for a web
application**: a `navigate()` outside a browser still throws the same `RouterError`.

The fallback lives in `Router.navigate()` and deliberately **not** in the router's blueprint. Pinning
it there would make "not configured" indistinguishable from "configured to be the browser", and an
adapter for another platform could never tell whether it was free to install its own: it could not,
and `navigate()` on a phone threw "browser environment" instead of navigating.

One ordering nuance for the curious: with a route name and no browser, the missing-route error now
surfaces before the missing-browser one, because resolving the path no longer waits behind a
platform check.

**`ViewEngine` no longer requires a DOM element to mount into.** `mount` and `hydrate` were typed
`(node, container: Element)`, a DOM type in the middle of the engine-agnostic contract. The host is
now a third type parameter defaulting to `Element`, so every existing engine and call site is
unchanged, and an engine on a platform with no element tree (React Native registers a root
component) can name its own host.

**`ReactViewEngine` no longer instantiates a `TextEncoder` at import time.** It moved inside the
streaming helper that uses it. Importing a module should not require a global that only server
streaming needs, and some client engines do not have it.

Together these are what a platform outside the browser needs from the shared layers, and they are
the reason the React Native work needs no fork of the router or of the view contract.
