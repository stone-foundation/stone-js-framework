---
"@stone-js/core": patch
---

chore: the API report refuses to run on a stale build

`scripts/api-report.mjs` reads `dist`, so regenerating the baseline from a build that no longer matches its sources writes a **false** surface: after a branch switch, a rebase or a merge, it silently removes names the committed baseline correctly had, or carries another branch's additions into this one.

That happened three times in a single day, each caught only because `api:check` failed afterwards. The write path now compares the newest modification time under each `src` with its `dist` and stops, naming the packages and saying what to do. The check path is untouched: a stale `dist` there produces a diff, which is already the right answer, and CI builds before checking anyway.

No published package changes; the patch is on `@stone-js/core` only so the repository has a release note for it.
