# continuum-showcase

A small example app that exercises the frontend features added in the 2026-07 continuum pass.
It doubles as a manual test bed for the new APIs.

## What it demonstrates

| Feature | Where |
|---|---|
| Fluent head/meta API (`createHead()`) | `app/pages/HomePage.tsx`, `app/pages/BlogPostPage.tsx` |
| Title template (`%s — …`) | both pages |
| Open Graph (incl. structured `og:image`) | both pages |
| Twitter card | both pages |
| JSON-LD structured data | both pages |
| Canonical + robots | HomePage |
| Data-driven head from the loader (`handle → head`) | BlogPostPage |
| Static-asset import via `@img` alias | `HomePage.tsx` (`import logo from '@img/logo.png'`) |
| Asset alias config | `stone.config.mjs` (`assets.aliases`) |
| SSR head serialization | `rendering: 'ssr'` |

## Run

> Requires the monorepo workspace to be installed (`pnpm install` at the root) so the
> `@stone-js/*` workspace packages resolve.

```bash
pnpm --filter continuum-showcase dev      # stone dev  — SSR dev server
pnpm --filter continuum-showcase build    # stone build
pnpm --filter continuum-showcase preview  # serve the build
```

## Manual verification checklist

1. `stone dev`, open `/` → view source: `<title>Home — Stone.js Showcase</title>`, `og:*`,
   `twitter:*` and a `<script type="application/ld+json">` are present in the SSR HTML.
2. The `@img/logo.png` import resolves (no build error) and the logo renders.
3. `/blog/hello-world` → head reflects the post data (`og:type=article`, per-post JSON-LD).
4. Put an actual `assets/images/logo.png` in place before running.

## Status

Reference example added in the continuum pass. End-to-end build/render still needs a run of
the CLI toolchain (Vite/browser) to be fully validated — it is correct against the current
`@stone-js/use-view` / `@stone-js/use-react` / `@stone-js/cli` APIs.
