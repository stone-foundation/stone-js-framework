---
"@stone-js/cli": patch
---

fix(cli): `stone test` could not discover modules in an installed project

`npm test` failed in every scaffolded project, on the first run, with an error about the
application's own entry file:

```
Unknown file extension ".tsx" for /path/to/app/Application.tsx
```

`createTestApp()` discovers an application's modules by importing them at run time, which is what
lets a test boot the same files the build builds instead of a list that drifts. Vitest externalises
anything resolved from `node_modules`, and an externalised module's `import()` is Node's own, which
cannot load a `.ts` or `.tsx` file. So the discovery could not import the very files it found.

`stone test` now inlines `@stone-js/testing` in the runner config it generates, which puts those
imports back through Vite's transform.

**Why it shipped, which is the part worth keeping.** Inside this repository `@stone-js/testing` is a
workspace link, and Vitest inlines linked packages by default. Every lab application and every
framework suite therefore passed, on every CI run, while every project installing from the registry
hit it on its first `npm test`. A monorepo cannot see this class of bug from the inside; it was found
by installing a published starter from the registry and running its tests, which is now worth doing
deliberately.
