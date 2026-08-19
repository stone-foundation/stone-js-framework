---
"@stone-js/router": patch
---

fix(router): group middleware runs before route middleware

`mergeDefinitions` assembled a child's middleware as `[child, parent]`, so a route's middleware ran **before** its group's. The documentation has always stated the opposite ("group middleware first, then route middleware"), so this was the code contradicting the contract.

Measured consequence on a pilot project: an anonymous request with an invalid body answered `422` with field-level details on a group guarded by authentication, instead of `401`. Work was done for an unauthenticated caller, and the response described the expected body shape of a protected surface, a free information leak.

Now `[parent, child]`, verified across two nesting levels. If you relied on the previous order, move the middleware to the level where you want it to run.
