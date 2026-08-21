---
"@stone-js/starters": patch
---

feat(starters): one domain, two applications

A monorepo where the interesting file is the one that runs everywhere. `@acme/domain` holds the
entities and the behaviour and imports `@stone-js/core` and nothing else about a platform: no
`Request`, no `Response`, no `window`, no `View`. `@acme/web` and `@acme/mobile` both depend on it,
and neither has a copy of it.

Their `Application.ts` files differ by two decorators, `@Browser()`/`@ReactNative()` and
`@UseReact()`/`@UseReactNative()`, and by nothing else. Their pages' `handle` and `head` are
identical line for line, because answering a route is not a platform question; only `render` differs,
and only in what it draws with.

The three suites sit at three levels, and the cheapest one carries the most: the domain boots nothing
and tests plain objects in milliseconds, the web application boots the real kernel and reads the HTML
that came back, and the mobile one boots the kernel, adapter and renderer under Node, sends a deep
link and asserts the navigation stack. The web and mobile suites make the same assertions about the
same domain through two different contexts, which is the claim the starter exists to demonstrate.

**Two things a web-and-mobile workspace genuinely needs, both documented in its README.** React is
pinned at the root, because Expo pins it exactly and a workspace holding one React with a different
React DOM fails at run time with "Incompatible React versions". And the domain's relative imports
carry their `.js`, because it is published as ESM under `moduleResolution: NodeNext`.

Verified: the domain builds and passes 8 tests, the web application builds (CSR) and passes 2, the
mobile one passes 3 with a clean `tsc --noEmit` and an `expo export` producing Hermes bytecode, with
Metro resolving the shared package across the workspace.
