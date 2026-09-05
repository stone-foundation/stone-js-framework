---
"@stone-js/starters": patch
---

fix(starters): the basic React starters build again

`npx stone build` on a freshly scaffolded `basic-react-declarative` or `basic-react-imperative` failed, with the framework's own error:

```
✖ App-level configuration must live in a .ts file, not a .tsx file.
Lazy views are on (detected from router usage). The following .tsx file(s) contain app-level decorators:
  app/Application.tsx
```

Reproduced on the published 0.8.19 tarball, untouched.

These two starters are **one file on purpose**: the application, its head and its view live in the same class, which is what makes them readable on the first day. Lazy views need the application-level configuration eagerly loaded, so they need it in a `.ts` without JSX, and splitting the starter in two to satisfy a build mode would cost exactly the thing it exists to show. Every other React starter already separates them, which is why only these two failed.

So they now say `lazy: false` out loud, in a `stone.config.mjs` that explains why. Auto-detection turns lazy views on as soon as the router is used, and a starter should not leave a scaffolded application failing its first build.

The gap this fell through is the scaffold smoke test that has been on the beta list since the beginning: no test in this repository has ever run `stone build` on a scaffolded application.
