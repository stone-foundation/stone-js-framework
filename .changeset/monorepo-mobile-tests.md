---
"@stone-js/starters": patch
---

test(starters): the monorepo starter's applications are tested the same way everywhere

Two pull requests crossed, and the monorepo starter came out of it inconsistent with the rest.

**Its web test was broken on `main`.** When `makeIncomingHttpEvent` moved to `@stone-js/testing/http`,
twenty-one files were updated; this one was on another branch at the time and so was missed. It now
imports from the subpath, and the application declares `@stone-js/http-core` explicitly rather than
relying on a peer resolution to provide it.

**Its mobile application now has the two suites the standalone starters have.**
`TaskListScreen.spec.ts` asks what a route resolves to, which every platform answers the same way, so
it reads exactly like the web application's test next to it: same domain, same assertions, same
counts, through two different contexts. `navigation.spec.ts` keeps the native question, with the real
adapter and the real screen stack. Its Vitest configuration inlines `@stone-js/testing`, which is what
lets module discovery import TypeScript at run time.

**And a debug file I left behind is deleted.** `lab/apps/spa/tests/probe.spec.ts` was committed by
accident with the monorepo starter, and it was already failing: it used the import that had just
moved. Nothing caught it because the lab applications are excluded from `test:ci`, which is worth
knowing on its own.
