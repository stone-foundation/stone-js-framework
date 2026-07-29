# Changelog

## 0.8.7

### Patch Changes

- 1ffedac: fix(cli): scaffold an exact starter with `--starter <id>`

  Every published starter command was broken: `--starters` takes provider _links_, so passing a starter id (`--starters basic-react-declarative`) asked npm for a package that does not exist and failed with a 404.

  - New `--starter <id>` flag: scaffolds that starter and skips the starter question. `--starters <links>` keeps its meaning (packages that declare starters).
  - The questionnaire answers are now merged into the blueprint instead of replacing it, so `--starters` links are no longer erased mid-run. Combining a link with an id (`--starters @stone-js/blog-starters --starter realtime-chat`) previously scaffolded an unrelated starter without warning.
  - An explicitly requested starter that matches nothing now fails and lists the available ids, instead of silently scaffolding the first one available.
  - A link that cannot be installed explains that `--starters` expects a package or git link, and points to `--starter` when the value looks like an id.
  - `stone init` no longer swallows failures: it exits non-zero, so scripts and CI can detect a broken scaffold.
  - The banner now shows the framework version on every command (it fell back to an empty slot, since nothing sets `stone.builder.version` and `init` has no project to read one from).
  - @stone-js/core@0.8.7
  - @stone-js/pipeline@0.8.7
  - @stone-js/config@0.8.7
  - @stone-js/filesystem@0.8.7
  - @stone-js/router@0.8.7
  - @stone-js/node-cli-adapter@0.8.7
  - @stone-js/use-react@0.8.7

## 0.8.6

### Patch Changes

- @stone-js/core@0.8.6
- @stone-js/pipeline@0.8.6
- @stone-js/config@0.8.6
- @stone-js/filesystem@0.8.6
- @stone-js/router@0.8.6
- @stone-js/node-cli-adapter@0.8.6
- @stone-js/use-react@0.8.6

## 0.8.5

### Patch Changes

- 64518fa: Remove deprecated build-tooling dependencies from scaffolded apps. `@rollup/plugin-multi-entry`
  (which pulled `matched` → `glob@7` → `inflight`, the memory-leaking, deprecated chain) is replaced
  at runtime by a tiny built-in virtual-entry plugin and kept only as a dev dependency for building
  the CLI itself; and the CLI's `glob` dependency is bumped to v11. A fresh `stone` app therefore
  installs with no `inflight` / `glob@7` / deprecated `glob@10` warnings. Since glob v11 requires it,
  the CLI now needs Node >= 20.11 (Node 18 is end-of-life).

  The built-in bundler also fixes Rollup's "Conflicting namespaces … will be ignored" warning: it
  re-exports each app file's members under a unique per-file alias, so two files exporting the same
  name (e.g. every i18n bundle exporting `common`, or two handlers exporting `routes`) no longer
  collide, and none is silently dropped from the module graph. Glob negation in the build input
  (e.g. `!app/i18n/**`) is supported too.

  - @stone-js/core@0.8.5
  - @stone-js/pipeline@0.8.5
  - @stone-js/config@0.8.5
  - @stone-js/filesystem@0.8.5
  - @stone-js/router@0.8.5
  - @stone-js/node-cli-adapter@0.8.5
  - @stone-js/use-react@0.8.5

## 0.8.4

### Patch Changes

- @stone-js/core@0.8.4
- @stone-js/pipeline@0.8.4
- @stone-js/config@0.8.4
- @stone-js/filesystem@0.8.4
- @stone-js/router@0.8.4
- @stone-js/node-cli-adapter@0.8.4
- @stone-js/use-react@0.8.4

## 0.8.3

### Patch Changes

- 2e561e8: Improve the `stone init` create-app experience.

  - Signature everywhere: the « Le Portail » banner (logo + wordmark + version) now prints on every
    command, not just `build`/`serve`, via a single lifecycle hook (the duplicated per-command
    banners are gone, so it shows exactly once).
  - Starters from the collection: `stone init` lists the individual starters declared in the fetched
    package's `stone.starters` manifest (title, description, tags), instead of treating the whole
    repository as one template. The default source is now the lightweight `@stone-js/starters` npm
    package (published alongside the framework and version-locked to it), so `stone init` no longer
    clones the whole monorepo. The selector stays fully agnostic: `--starters` still accepts any
    local path, npm package or git/github link.
  - Fix module integration: selected Stone modules were installed by the package manager and then
    silently dropped, because the finalize step rewrote the pre-install copy of `package.json`. The
    freshly-installed manifest is now re-read, so the chosen modules land correctly in the new app.
  - A wider module picker: the full adapter range (Node HTTP/CLI/WS, AWS, Azure, GCP, Tencent,
    Alibaba, edge, fetch, browser) plus React and the view engine.
  - @stone-js/core@0.8.3
  - @stone-js/pipeline@0.8.3
  - @stone-js/config@0.8.3
  - @stone-js/filesystem@0.8.3
  - @stone-js/router@0.8.3
  - @stone-js/node-cli-adapter@0.8.3
  - @stone-js/use-react@0.8.3

## 0.8.2

### Patch Changes

- Updated dependencies [d7f213c]
  - @stone-js/core@0.8.2
  - @stone-js/filesystem@0.8.2
  - @stone-js/node-cli-adapter@0.8.2
  - @stone-js/router@0.8.2
  - @stone-js/use-react@0.8.2
  - @stone-js/pipeline@0.8.2
  - @stone-js/config@0.8.2

## 0.8.1

### Patch Changes

- Updated dependencies
  - @stone-js/core@0.8.1
  - @stone-js/filesystem@0.8.1
  - @stone-js/node-cli-adapter@0.8.1
  - @stone-js/router@0.8.1
  - @stone-js/use-react@0.8.1
  - @stone-js/pipeline@0.8.1
  - @stone-js/config@0.8.1

All notable changes to the "Stone.js CLI" extension will be documented in this file.

## Unreleased

## [0.1.3](https://github.com/stone-foundation/stone-js-cli/compare/v0.1.2...v0.1.3) (2026-06-13)

### Miscellaneous Chores

- update Stone core dep ([d19c1f4](https://github.com/stone-foundation/stone-js-cli/commit/d19c1f42a26148dc0bf8fe3b17c8569609f4bbd2))
- update Stone core dep ([#28](https://github.com/stone-foundation/stone-js-cli/issues/28)) ([8a58296](https://github.com/stone-foundation/stone-js-cli/commit/8a5829609e8e686014bc905f99674e7c04274ce7))

## [0.1.2](https://github.com/stone-foundation/stone-js-cli/compare/v0.1.1...v0.1.2) (2025-06-28)

### Bug Fixes

- change domain name to stonejs.dev ([#11](https://github.com/stone-foundation/stone-js-cli/issues/11)) ([dce0000](https://github.com/stone-foundation/stone-js-cli/commit/dce0000152d9346b004b0468edd8a21311cdd813))

## [0.1.1](https://github.com/stone-foundation/stone-js-cli/compare/v0.1.0...v0.1.1) (2025-06-16)

### Bug Fixes

- skip vite virtual module on removing unused modules ([#8](https://github.com/stone-foundation/stone-js-cli/issues/8)) ([bb2fb9a](https://github.com/stone-foundation/stone-js-cli/commit/bb2fb9aa1087ec500c9fde28ff57110c8ed48467))

## 0.1.0 (2025-06-14)

### Features

- initial commit with CLI integration to build any Stone.js app ([d883217](https://github.com/stone-foundation/stone-js-cli/commit/d883217a34566f4a9acb464aed221a159a6d7dc1))
