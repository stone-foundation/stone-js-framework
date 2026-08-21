---
"@stone-js/testing": patch
---

feat(testing): a browser or native application can be tested like any other

`createTestApp()` could not test an application that renders. Dispatching `makeIncomingEvent()` into
one failed with `event.fingerprint is not a function`, thrown from inside the kernel's error handler,
which names nothing that would let a reader find the cause.

The cause is small and the fix is smaller: a browser application, and a React Native one, receive an
`IncomingBrowserEvent`, and the React renderer keys its hydration snapshot on that event's
`fingerprint()`. The platform-agnostic event has no such method, and there was no factory for the one
that does.

`makeIncomingBrowserEvent` builds it:

```ts
import { createTestApp } from '@stone-js/testing'
import { makeIncomingBrowserEvent } from '@stone-js/testing/browser'
import { REACT_NATIVE_PLATFORM } from '@stone-js/react-native-adapter'

const app = await createTestApp({ platform: REACT_NATIVE_PLATFORM })
const response = await app.send(makeIncomingBrowserEvent({ url: 'myapp://tasks/42' }))
```

A deep link is a URL with the application's own scheme, and the factory keeps schemes rather than
resolving them away, so the route a phone reaches is the route a test reaches.

**It lives behind `@stone-js/testing/browser`** so `@stone-js/browser-core` stays an optional peer: a
service has no reason to install a browser package to run its tests, and the main bundle imports
nothing from it.

Verified against the React Native starter: `createTestApp` returns a 200 whose head carries
`"Ada · Welcome to Stone.js"`, so the route resolved, the loader read the deep link's query parameter
and `head` ran. The response path was never the problem, only the event.
