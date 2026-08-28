---
"@stone-js/pipeline": patch
---

fix(pipeline): a class handed over without a marker is a class

`PipeType` names `PipeClass` as one of the four shapes a pipe may take, and `defineMiddleware(SomeClass)` adds no marker. Yet an unmarked class was treated as a function and **called**:

```
TypeError: Class constructor BareMiddleware cannot be invoked without 'new'
```

Thrown from the pipeline at the first request, on something the type accepted and this module's own helper produced. Reported by a pilot as SJ-46, reproduced on the published 0.8.18.

A class is recognised now, with or without `isClass: true`. Detection is exact for the ES2022 output these packages publish: a class declaration's `prototype` is non-writable and a function's is writable.

The marker still wins where detection cannot see, since a class transpiled down to a function is a function at runtime, and an explicit `isFactory` or `isAlias` outranks the inferred class, because what someone wrote beats what the runtime can guess.

Five tests, two of which fail without the fix, including a bare class carried end to end through a real pipeline.

One name joins the public surface, `isClassLike`, next to the `isConstructor` and `isFunction` this package already exports: telling a class from a function is the question this fix turned out to be about, and an application writing its own resolver asks it too.
