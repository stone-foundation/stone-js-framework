---
"@stone-js/env": patch
---

docs(env): explain the value cache and when to clear it

A pilot project concluded that no purge function existed and that the cache defeated live configuration. Neither is true: `clearCache()` has always been exported, and `@stone-js/config-source`'s `envSource` reads `process.env` directly, so live reloads are unaffected. What was missing is the *why*: the README documented the function without ever stating that values read through `custom()` are memoized for the process lifetime, so nobody could tell when they needed it.

A new Caching section states the semantics, shows the test-suite pattern (`clearCache()` after mutating `process.env`), and records that config sources bypass the cache.
