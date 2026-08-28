---
"@stone-js/rate-limit": patch
---

fix(rate-limit): a subject that stringifies to `[object Object]` is not a subject

`String(value)` answers `'[object Object]'` for anything that never defined its own `toString`, and that string makes a perfectly good bucket key. So every caller whose subject happened to be an object landed in the same bucket and spent each other's budget: two strangers, one limit, no error, no warning, every test green.

Two doors led there. A principal whose `id`, `sub` or `userId` is an object, which is what several database drivers hand over. And a request field declared as the subject, `by: 'email'`, arriving as an object because a client sent one.

Such a value is now refused as a subject, so the request falls back to the address bucket, which is this module's designed degradation and which warns. A value carrying its own `toString`, an object id from a driver, a `Date`, an array, still says something distinct and is kept.

Also: what a rule bills is now written once as a label rather than three times as the same conditional, which is what put `enforce` over the complexity limit.
