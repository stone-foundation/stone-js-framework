---
"@stone-js/use-react-native": patch
---

feat: `@stone-js/use-react-native`, so your pages become native screens

The renderer half of the mobile story. A page that answers `/tasks/:id` behind an HTTP adapter
answers it on a phone too, with the same decorator, the same loader, the same layout, the same
error pages and the same hooks. What changes is where the result goes: a browser replaces a
document, a phone pushes a screen onto a stack.

Everything before that last step comes from `@stone-js/use-react-core` unchanged, which is
what the extraction was for. This package is small because of it.

**A stack, as plain state.** `ScreenStack` holds the screens, with `push`, `replace` and
`reset` semantics and nothing else: no React, no navigation library. That is deliberate. It
means the navigation semantics are testable without a device, and it means the display is
yours to choose. `StoneNativeApp` shows the top screen with nothing to install, so an
application runs the moment the packages are installed; a native navigator
(`@react-navigation/native-stack`) drives itself from the same object and brings what only it
can bring: the platform's transitions, the swipe-back gesture, and a screen keeping its own
state while another covers it. The README shows that wiring. This package imports nothing but
React and Stone.js, so it adds no native module and no build step of its own.

Navigating goes through the router (`useNavigate`), never straight to the stack, so a route's
middleware and loader run exactly as they would for a deep link. `reset` empties the stack
before navigating rather than travelling as an intent, because the router's navigation API
carries whether to replace and nothing more, and inventing a third channel for it would be a
fiction.

Two smaller decisions worth knowing. `NativeViewEngine` implements the agnostic view contract
with the screen stack as its host, which is exactly what that contract's host parameter was
generalised for, and it refuses `renderToString` loudly rather than returning something
meaningless, so an application misconfigured for SSR says so. And a page's head has nowhere to
go on a device, so its title becomes the screen's title and the rest is dropped.

Also included: `NativeRuntime` under the same `reactRuntime` alias the web runtime uses, so a
component asking for the runtime gets the one for the platform it is on; `@UseReactNative()`
and `useReactNativeBlueprint` as the two activation paths; and `defineStoneReactNativeApp`
with the same signature as its web counterpart, so an application moving to a phone changes
which function it calls and nothing else.
