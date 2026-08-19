---
'@stone-js/cli': patch
---

Expand dynamic segments at SSG time from declared values (`ssg.params`).

SSG discovery skipped any parameterized path, which one common pattern turned into a total loss: a
parameterized router prefix. A localized site setting `stone.router.prefix` to `/:lang?` puts a
dynamic segment on *every* route, so every route was skipped and auto-discovery went from all pages
to none, leaving the developer to hand-write the whole `pages × locales` grid the framework already
knew.

`ssg.params` gives a segment its values and the path expands instead:

```js
ssg: { params: { lang: ['en', 'fr'] } }   // /:lang?/about -> /about, /en/about, /fr/about
```

An optional segment also yields the path without it, canonical form first, which reproduces the
bare-path-plus-prefixed-twins grid from a single declaration. Several segments expand as a cartesian
product, a repeated segment stays consistent with itself, and a declared value that contradicts its
own segment constraint fails the build rather than pre-rendering a path the router can never match.

Paths that still cannot be expanded behave exactly as before, but are now reported once with the
segments they would need, so a site can no longer pre-render a fraction of itself in silence.
`ssg.routes` is unchanged and still additive.
