---
"@stone-js/cli": patch
---

Remove deprecated build-tooling dependencies from scaffolded apps. `@rollup/plugin-multi-entry`
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
