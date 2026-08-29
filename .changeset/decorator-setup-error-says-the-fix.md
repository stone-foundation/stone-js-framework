---
"@stone-js/core": patch
---

fix(core): the legacy-decorator error names the way out

Running `vitest` directly on a Stone.js application fails on the first decorated class:

```
SetupError: Class decorators must be used with the 2023-11 decorators proposal.
This usage is not supported.
```

That message names neither the cause nor either fix, and it is the one a developer actually meets. The framework already had a good message explaining exactly this, on the neighbouring branch, for a case that fires far less often.

The three terse messages now carry the same guidance, written once so the four cannot drift: the cause is a transformer emitting legacy decorators, `experimentalDecorators: true` makes esbuild (so Vite and Vitest) emit that form, and there are two ways out. `stone test` sets the right semantics for you, and a project keeping its own runner config sets them itself with `esbuild.tsconfigRaw.compilerOptions`.

Measured on a scaffolded application: the same decorated class fails under a bare `vitest run` and passes under `stone test`, and passes under a plain runner config carrying those two options.
