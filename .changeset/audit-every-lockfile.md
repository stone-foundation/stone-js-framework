---
"@stone-js/core": patch
"@stone-js/rate-limit": patch
"@stone-js/mcp": patch
"@stone-js/notifications": patch
---

fix: the security audit follows the lockfiles, and a few smells go with it

A vulnerable transitive `uuid` sat in the monorepo starter, seen by Dependabot and by nothing else. Two separate holes let it, and both are measured rather than assumed.

**The audit only looked at the root.** A starter with its own lockfile resolves independently: the root's `pnpm.overrides` never reached it, so the `uuid@<11.1.1` pin that protects every other package did nothing there. The audit now follows the **lockfiles** rather than the workspace, through `scripts/audit-lockfiles.mjs`, and CI runs the same script as `pnpm run audit:ci` so the two cannot drift. Verified by pointing it at the vulnerable lockfile: it fails and names the path, `apps__mobile>expo>@expo/config-plugins>xcode>uuid`.

**The threshold was above the advisory.** `pnpm audit` classifies this one `moderate`, so a gate at `high` would never have stopped it, wherever it ran. Measured before changing it: the repository is clean at `low`, so `moderate` costs nothing today and catches the class that got through.

Nothing local ran the audit either, so there is now a `pre-push` hook for it alone, seconds against the registry, and a `pnpm run verify` that bundles the whole pre-push gauntlet for when you want all of it.

Also, twelve reported smells, each a real one. Four object literals used as default parameters, rebuilt on every call and now named values. `String(value)` on an `unknown` in two places, where an object would have landed as `[object Object]` in a message somebody reads or in a URL that matches no route: both now leave the placeholder, visibly unfinished. A nested template literal, a nested ternary, two verbose character classes, and an import that existed only to be re-exported.
