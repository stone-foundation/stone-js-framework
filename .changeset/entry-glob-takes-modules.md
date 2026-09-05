---
"@stone-js/use-react": patch
---

fix(use-react): the generated entry takes modules, not everything under `app/`

The client, server and dev entries globbed `app/**/*.**` and eagerly imported the result. That takes images, stylesheets and JSON, and **i18n catalogues above all**: they live at the conventional `app/i18n`, they are meant to load one locale at a time, and a static import always wins over a dynamic one. So an application with lazy i18n shipped every catalogue of every locale in its entry chunk, and the only sign was a wall of Rollup warnings inside a build log.

Reported by a pilot with 68 catalogues in two languages, whose entry chunk carried 860 KB of translations a given reader would never read.

**Reproduced without any i18n at all**, which is what says where the defect is: two JSON files under `app/i18n` in the published React starter, and both strings land in the entry chunk. Nothing imported them.

The entries now glob modules: `app/**/*.{ts,tsx,js,jsx,mjs}` when pages are bundled with everything else, `app/**/*.{ts,js,mjs}` when they come through their own module. Written once, used at the five places that generate an entry, so they cannot drift apart again. An entry spreads each module's exports into `stoneApp({ modules })`, so a data file swept in was not only weight in the chunk, it was junk in the module list.

`stone.builder.input.all` and `stone.builder.input.app` still override, as before. One correction to the report: **they are read.** Measured on the starter, setting `input.all` does move the catalogues out of the entry. An application seeing no effect from it is almost certainly carrying its own exported `client.ts` whose glob is written out literally instead of `%pattern%`: the generator replaces the placeholder, and a file without one keeps whatever it was exported with, forever.
