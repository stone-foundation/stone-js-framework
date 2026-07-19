# Stone.js website

The Stone.js website and documentation, built with Stone.js itself (use-react, SSG). Dogfooding is the point: the site is the proof.

## Run it

```bash
npm run dev       # dev server (SSR) with HMR
npm run build     # SSG build (pre-renders the routes listed in stone.config.mjs)
npm run preview   # serve the production build
```

## Design system (light, reusable)

Identity: « Obsidienne & Braise ». Single source of truth for values: the brand charter (tokens v1.0).

- `assets/css/index.css` is layered and is the only stylesheet:
  1. **tokens**: colors, fonts, motion (`--bg`, `--braise`, `--ease`, ...). Both themes at parity: `prefers-color-scheme` + `[data-theme]` override.
  2. **base**: reset, typography defaults.
  3. **primitives**: `.wrap`, `.eyebrow`, `.btn`, `.icon-btn`, `.sec-head`, `.reveal`, `.code` (+ syntax classes `.kw/.fn/.st/.cm`). Reuse these before writing new CSS.
  4. **sections**: one block per landing section, prefixed by its component.
- `app/components/ui/`: behavioral primitives (`Reveal` for scroll reveals).
- `app/components/brand/`: the brand (`Portal`, the emblem; unique gradient `id` per instance).
- `app/components/`: chrome (`Header`, `Footer`).
- `app/sections/`: one file per landing section. A section owns its copy and its data.
- `app/pages/`: routed pages (`@Page`). Pages compose sections; they hold no styling.

Rules:
- No em-dashes in copy. Use a period, comma, colon or a middot (·).
- The Braise gradient is reserved for the keystone and primary CTAs. Cuivre is ornament only.
- Every animation must respect `prefers-reduced-motion` (see section 13 of the CSS).
- New pages: add the route to `stone.config.mjs` (`ssg.routes`).

## Docs system (light design, built to grow)

The documentation is a dogfooded set of Stone.js pages under a shared layout.

- `app/docs/nav.ts` is the **single source of truth** for the whole course: sections and
  pages. It drives the sidebar and the prev/next pager. Pages not written yet are marked
  `soon` (shown greyed, excluded from routing and the pager), so the course shape is always
  visible without dead links. `DOC_ROUTES` lists the built pages; mirror it in
  `stone.config.mjs` (`ssg.routes`) when a page ships.
- `app/docs/DocLayout.tsx` is the `@PageLayout({ name: 'docs' })`: header, sidebar,
  article outlet, TOC, footer, mobile drawer. Pages opt in with `@Page(path, { layout: 'docs' })`.
- `app/docs/components/`: `Sidebar`, `Toc` (reads rendered headings, scroll-spy),
  `ParadigmSwitch`, and content primitives:
  - `content.tsx`: `ArticleTop`, `Lead`, `H2`/`H3` (auto-anchored for the TOC), `Callout`
    (`note` / `important` / `future`), `Principle`, `Aphorism`, `Pager`.
  - `Code.tsx` + `highlight.ts`: `Code` (single block) and `CodeTabs` (paradigm-aware),
    syntax-highlighted with Prism. Highlighting is isomorphic and deterministic, so the SSG
    output already ships coloured and hydration matches. Token colors come from `--hl-*`
    design tokens (bespoke « Obsidienne & Braise » theme, follows light/dark).
- `app/docs/pages/`: one file per page. A page returns `ArticleTop` + content + `Pager`.

Two conventions carry the pedagogy (see the strategy plan §0):
- **Taught twice**: every Foundations concept uses `<Principle principle={…} incarnation={…} />`
  (the agnostic truth, then the Stone.js incarnation).
- **The global paradigm switch**: `<CodeTabs decl imp />` renders BOTH variants; a
  `data-paradigm` attribute on `<html>` reveals exactly one via CSS. No hydration mismatch,
  declarative shows even without JS, and the choice persists (restored before paint by the
  no-flash script in the layout). Theme works the same way.

To add a page: create it under `app/docs/pages/`, flip its `soon` off in `nav.ts`, add its
path to `stone.config.mjs`. Nothing else to wire (pages are auto-discovered by decorator).

`public/` is copied verbatim to the build root. It holds `llms.txt` (the machine-readable
docs map served at `/llms.txt`, keep it in sync with `nav.ts`), `CNAME` (the custom domain)
and `.nojekyll` (so GitHub Pages serves `/pagefind/*` and any underscore paths).

## Search

Full-text search is [Pagefind](https://pagefind.app): self-hosted, no external service, CSP-
friendly. The build indexes the SSG HTML (`npm run build` = `stone build && pagefind --site dist`).
Only docs pages are indexed (`.doc-article` carries `data-pagefind-body`; the landing carries
`data-pagefind-ignore`). `app/docs/components/Search.tsx` is a Cmd/Ctrl+K modal that loads the
Pagefind runtime from `/pagefind/` at runtime and degrades gracefully when the index is absent
(e.g. the SSR dev server). To try search locally, serve the built output statically
(`npx serve dist`), not the SSR preview.

## i18n

English first. `app/i18n.ts` is the seam a second language plugs into: it declares the locales
and the URL scheme (default locale at the root, others prefixed `/fr/...`) with `localizedPath`
/ `stripLocale`. Content and locale-prefixed route registration are a dedicated later pass; the
document already ships `<html lang="en">`.

## Deploy

GitHub Pages via `.github/workflows/deploy-website.yml`: Turbo builds the workspace deps then
the website (SSG + Pagefind), and the `dist/` is published. Served on a custom domain, so the
base path is `/` (no URL rewriting). Change the domain in `public/CNAME`.

## Storytelling

The Continuum, told through quantum mechanics: the domain lives in superposition across
contexts; runtime is the observation that collapses it. Copy follows the manifesto:
https://evens-stone.github.io/continuum-manifesto/manifesto
