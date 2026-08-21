---
"@stone-js/starters": patch
---

test(starters): a native screen is tested the way a web page is

The React Native starters tested their domain through the real adapter, supplying a navigation source
and a screen stack, because nothing else could reach a native application. That was fifty lines to
answer a question every platform answers the same way: what does this route resolve to.

Each starter now has two suites, and the split says which question is which.

`tests/HomeScreen.spec.ts` is the web starters' test, unchanged in shape: `createTestApp()` discovers
`app/**`, one event goes through the kernel, and the head proves the loader read the deep link's
parameter. Six lines of setup became one.

```ts
const app = await createTestApp({ platform: REACT_NATIVE_PLATFORM })
const response = await app.send(makeIncomingBrowserEvent({ url: 'stone://app/?name=Ada' }))
```

`tests/navigation.spec.ts` keeps what only a device does: the real React Native adapter, the real
screen stack, a deep link pushing a screen, and the stack replacing rather than duplicating a route
already on top. Nothing is substituted there, on purpose.

**Their Vitest configuration now inlines `@stone-js/testing`**, which is what lets `createTestApp()`
import an application's TypeScript at run time. `stone test` does this for a project it drives; an
Expo project runs Vitest directly, so it states it itself. Without it, discovery fails with
`Unknown file extension ".ts"`, naming the application's own entry file.
