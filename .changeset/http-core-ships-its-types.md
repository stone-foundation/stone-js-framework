---
"@stone-js/http-core": patch
"@stone-js/rate-limit": patch
---

fix(http-core): the published types resolve for a strict consumer

`@stone-js/http-core` referenced `send`, `accepts` and `range-parser` from its **published** declarations while their `@types/*` sat in `devDependencies`. So a consumer compiling with `skipLibCheck: false`, which is what a careful team turns on, got three `TS7016` errors from inside our own package and had to install type packages it never asked for.

The three are `dependencies` now, which is what a package referencing them from its public API owes its consumers. Measured on a real install from the registry: those were the only three errors of that kind across every published entry point.

Also in `@stone-js/rate-limit`, the guard that decides whether a value identifies a subject is now a **type guard**. It already made `String(value)` safe, and the comment said so; saying it in the type says it to the compiler instead, which is what the analyser was asking for.
