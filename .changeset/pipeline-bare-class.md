---
"@stone-js/pipeline": patch
---

fix(pipeline): a class handed over without a marker is a class

`PipeType` names `PipeClass` as one of the four shapes a pipe may take, and `defineMiddleware(SomeClass)` adds no marker. Yet an unmarked class was treated as a function and **called**:

```
TypeError: Class constructor BareMiddleware cannot be invoked without 'new'
```

Thrown from the pipeline at the first request, on something the type accepted and this module's own helper produced. Reported by a pilot as SJ-46, reproduced on the published 0.8.18.

A class is recognised now, with or without `isClass: true`: a class's `prototype` is non-writable, a function's is writable, an arrow has none.

**That survives transpilation to ES5, which is the case that matters.** A browser build compiles an application with `@babel/preset-env` against that application's own `browserslist`, so a class written in user code can reach the runtime as a function. Babel lowers it through `_createClass`, which ends with `Object.defineProperty(e, 'prototype', { writable: false })` precisely to preserve class semantics. Measured against a real ES5 build targeting `ie 11`: a class with its method on the prototype and a class with its method as an instance field are both recognised, a plain function and an arrow function are not, and the lowered class throws `TypeError: Cannot call a class as a function`, which is this defect wearing a different message. A test pins the lowered shape.

An explicit `isFactory` or `isAlias` still outranks the inferred class, because what someone wrote beats what the runtime can guess, and `isClass: true` keeps working for anything neither of us foresaw.

Five tests, two of which fail without the fix, including a bare class carried end to end through a real pipeline.

One name joins the public surface, `isClassLike`, next to the `isConstructor` and `isFunction` this package already exports: telling a class from a function is the question this fix turned out to be about, and an application writing its own resolver asks it too.
