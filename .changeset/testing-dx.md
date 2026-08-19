---
'@stone-js/testing': patch
'@stone-js/filesystem': patch
'@stone-js/core': patch
---

Boot the real application in a test without listing it, and read its response.

`createTestApp()` now discovers the app from `app/**` instead of requiring a hand-written module
list. A list drifts, and it drifts silently: a forgotten handler answers 404 and reads as a routing
bug, a forgotten `@Configuration` makes a whole suite validate behaviour production does not have.
Which files count is decided by `@stone-js/filesystem`, the same definition the CLI uses, so a suite
cannot boot a different application than the one that ships. Listing modules stays possible, for a
test that deliberately runs a slice of the app.

Also new: `bindings` substitutes container registrations (a fake repository, a fixed clock) through a
real provider, so the code under test resolves the fake exactly as it resolves the real one;
`envFile` loads `.env.test` before booting; and the response exposes `json()`, `text()` and `html()`,
because `content` is the wire payload and every project was writing the same parsing helper. A
rendered page is asserted with `html()` like any other response, with no assertion library bundled
here on purpose.

`@stone-js/filesystem` gains `appModuleFiles()` and `DEFAULT_APP_MODULES_PATTERN`, the one definition
of an application's source files. `@stone-js/core` now re-exports `BindingValue` alongside
`IContainer`, so a module registering something on the container can name what it may bind.
