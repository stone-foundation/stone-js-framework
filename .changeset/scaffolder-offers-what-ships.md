---
"@stone-js/cli": patch
---

fix(cli): the scaffolder offers what the framework ships, and puts a test runner where it belongs

**Fifteen published packages were invisible to `npx @stone-js/create`.** A whole wave of modules
shipped and the questionnaire never learned about them: validation, resources, openapi, auth, authz,
i18n, store, cache, queue, event-bus, realtime, cloud-file, telemetry, and both mobile packages. A
list that only grows by hand stops matching what exists, and the only sign was that nobody could pick
them.

They are grouped now, so the list reads by what a module is for rather than by when it was added:
frontend, mobile, domain and API, infrastructure, then the runtimes. `@stone-js/testing` and
`@stone-js/mcp-dev` are deliberately absent, being development tools rather than parts of an
application.

**And the test runner was being installed as a runtime dependency.** `npm install vitest
@vitest/coverage-v8`, with no `--save-dev`, so a deployed application shipped its test runner, and a
starter that already declared Vitest in `devDependencies` had it moved into `dependencies` by the
scaffold. Runtime modules and test tooling are installed separately now, the second with the flag
each package manager spells its own way.

One thing that did not change, and is now covered: a runner named in the configuration rather than
chosen at the prompt is still installed, and only Vitest brings a coverage provider along.
