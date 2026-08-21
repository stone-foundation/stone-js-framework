---
"@stone-js/use-react-core": patch
"@stone-js/use-view": patch
"@stone-js/starters": patch
---

docs: the framework's examples stop citing a private package

The view provider documentation taught its two registration paths with `@noowow/design-system`,
a package nobody reading the docs can install, listed among MUI and Chakra as though it were one of
them. It shipped in the published declarations and in TypeDoc. The examples now use MUI's real
`createTheme` / `ThemeProvider`, which is the archetypal case the mechanism exists for, and which
a reader can actually run.

It also fixes the examples: both snippets passed a `theme` that was never defined in them.

**And the full React starters stop scaffolding someone else's copyright.** Their footers read
`2025 Stone.js © Noowow Labs` and `Stone.js © 2025 Stone Foundation`, so an application generated
from a starter shipped a client's or the framework's name in its own footer, with a year that was
already stale. They now read `© <current year> Your Company · Built with Stone.js`: a placeholder
that says what to replace.
