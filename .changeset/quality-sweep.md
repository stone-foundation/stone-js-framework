---
'@stone-js/cli': patch
'@stone-js/testing': patch
'@stone-js/store': patch
'@stone-js/authz': patch
'@stone-js/http-core': patch
'@stone-js/openapi': patch
---

Clear the quality findings this cycle's work raised.

Two are worth naming because they were real, not stylistic. An authorization failure built its message
with `String(subject)`, so refusing a class or an instance said `Not allowed to read [object Object]`
— an error that names nothing. And two regular expressions could be made super-linear by their own
input: a trailing-slash strip in the test-module scan, and the declaration-rewriting pattern in the
shared build, both rewritten so no input can force them to backtrack.

The rest is shape: the SSG segment parser split into three named readers instead of one function
holding every case, a nested ternary unfolded in the OpenAPI plugin, a duplicated directory walk
shared in the build config, an escaped pattern read as `String.raw`, and a rejection path turned into
a single exit so the error is raised where its message lives.

`CORSHeadersMiddleware` and `MetaCORSHeadersMiddleware` are **removed**. They were deprecated with a
documented replacement (`@Cors()` or `corsBlueprint`, the two ways a module is enabled), nothing in
the framework used them, and a deprecated third activation path is worth deleting rather than keeping
around to trip over.
