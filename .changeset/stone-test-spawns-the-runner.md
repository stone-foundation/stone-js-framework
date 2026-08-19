---
'@stone-js/cli': patch
'@stone-js/testing': patch
---

`stone test` spawns the runner, and pins the decorator semantics the framework runs on.

Verified against a real application rather than a mock, which surfaced two defects in the first
design. Importing Vitest's Node API joined two module graphs: this package is bundled, so a runner it
does not depend on was bundled with it and broke with `esbuildVersion is not defined` — nothing to do
with the project's tests, and reported as "Vitest is not installed", which was false. The runner is
now a child process, resolved from the project: it owns its exit code and its watch loop, and a
missing binary is diagnosed by looking for it rather than by catching an import.

The generated config lands in `.stone/vitest.config.mjs`, readable when a run surprises you, and it
pins TC39 stage-3 decorators for the transform. A project's `tsconfig.json` keeps
`experimentalDecorators: true`, which is what TypeScript's checker wants and what the build overrides
with Babel `version: '2023-11'` afterwards. A test runner transpiles instead of building, so without
this it emitted the legacy form and every decorated class failed to boot. Class fields are pinned to
the same spec semantics the build uses.

`@stone-js/testing` also stops crashing when an application produces no response: attaching the body
readers to a non-object threw inside the harness and buried the real reason.
