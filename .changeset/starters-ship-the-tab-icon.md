---
'@stone-js/starters': patch
---

Ship the favicon every scaffolded React app was already asking for.

The generated HTML entry point links `/favicon.svg`, which no starter shipped, so the first thing a
new user saw was the browser's default globe in the tab, and a 404 in dev, in SSR and in the built
output. All seven React starters now ship `public/favicon.svg`: the Stone.js mark, with the
`prefers-color-scheme` rule that keeps it legible on a light or a dark tab strip.
