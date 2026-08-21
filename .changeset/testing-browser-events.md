---
"@stone-js/testing": patch
"@stone-js/starters": patch
---

feat(testing): platform-agnostic, and able to test what an application actually receives

Three things, one theme: a test should reach for the platform it is testing, and nothing else.

**`@stone-js/http-core` is no longer a dependency.** It was a required peer, so every project
installed an HTTP package to run its tests: a React Native application did, a CLI one did, a worker
did. `makeIncomingHttpEvent` now lives behind `@stone-js/testing/http` and the peer is optional. The
main entry imports no platform package at all, verified in the emitted bundle. Measured the other way
too: a React Native project with no HTTP package installed anywhere boots through `createTestApp` and
resolves its route.

**A browser or native application can be tested at all.** Dispatching `makeIncomingEvent()` into one
failed with `event.fingerprint is not a function`, thrown from the kernel's error handler.
`makeIncomingBrowserEvent`, behind `@stone-js/testing/browser`, builds the event those applications
receive, and keeps schemes rather than resolving them away, so a deep link like `myapp://tasks/42`
reaches in a test the route it reaches on a phone.

**`blueprint` is now an override.** It was merged before the application's own modules, and
`@StoneApp` carries the default blueprint, which sets nearly every key: anything passed through the
option was overwritten, so it could only ever affect keys no application touched. It is merged after
them now, which is the only ordering a test can use. This is the configuration counterpart of
`bindings`: one replaces a service, the other replaces a value.

```ts
const app = await createTestApp({ blueprint: { stone: { debug: true } } })
```

**Migration is one import line**, and every starter and lab application in the repository has been
moved: `makeIncomingHttpEvent` comes from `@stone-js/testing/http`. The two SPA starters moved further
and now use `makeIncomingBrowserEvent`, because a browser application receives a browser event; the
SSR and SSG ones keep the HTTP event, because they are genuinely served over HTTP.
