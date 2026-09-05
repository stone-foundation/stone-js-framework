---
"@stone-js/use-react": patch
---

chore(security): eight advisories published since the last release

The lockfile audit refused, on both lockfiles, without a single dependency having changed here: the advisories are new, which is the whole reason that gate follows the lockfiles rather than a list somebody maintains.

`browserslist` is the one that mattered, because it is a **direct** dependency of `@stone-js/use-react` and its two advisories are rated high (unbounded memory growth, and a crash through a prototype write). The declared range already allowed the patch, so refreshing was enough.

The rest are transitive and pinned through `pnpm.overrides`, each in the lockfile that owns it, since a nested lockfile does not inherit the root's: `fast-uri` moved from `>=4.1.2` to `>=4.1.3` (three high advisories), `qs` to `>=6.16.0`, and `@xmldom/xmldom` to `>=0.8.15` and `>=0.9.12` in the monorepo starter, where two branches of it coexist under Expo and each needed its own pin.

Nothing in the framework's own code changes.
