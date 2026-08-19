---
"@stone-js/cli": patch
---

fix(deps): clear the nanoid advisory reached through vite and postcss

`pnpm audit --audit-level=high` failed on `nanoid <3.3.18` (custom generators can loop indefinitely when size is zero), reached through `vite > postcss > nanoid`. Pinned with a caret inside its major line, as every override in this repository must be: an open-ended `>=` lets pnpm jump major and has twice installed something worse than what it was fixing.
