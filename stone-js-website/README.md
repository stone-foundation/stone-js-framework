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

## Storytelling

The Continuum, told through quantum mechanics: the domain lives in superposition across
contexts; runtime is the observation that collapses it. Copy follows the manifesto:
https://evens-stone.github.io/continuum-manifesto/manifesto
