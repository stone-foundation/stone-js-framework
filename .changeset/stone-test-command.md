---
'@stone-js/cli': patch
---

`stone test`: run the suite from the same config file as everything else.

Tests are a context like any other, so they are configured where every other context is. A project
declares its test run in `stone.config.mjs` under `test` — `include`, `envFile`, `pattern`, and a raw
`vitest` escape hatch merged over the defaults, exactly as `vite` and `rollup` are — instead of
keeping a second config file in sync with the first.

Two things this does that a bare runner cannot. It loads `.env.test` **before** the runner starts, so
a value read at module load (a `@Configuration` calling `getString`) actually sees it; loading the
same file from inside a test is too late, the imports have already run. And it hands the test process
the file set the build uses, so `createTestApp()` discovers exactly what ships.

Vitest is imported lazily from the project rather than bundled: an application pins its own runner
version, and one that does not test carries none. A project without it gets a line telling it what to
install, not a module-resolution error.

`stone test` answers to `-t`, the letter going to the command a developer types all day.
**`stone typings` moves from `-t` to `-ty`**; its full name is unchanged, and nothing in the starters
or the docs used the short form.
