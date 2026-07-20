import { defineConfig } from '@stone-js/cli'

/**
 * Zero-config by design.
 *
 * The rendering strategy is deduced from the stacked adapters (browser +
 * node-http, so SSR), and SSG is selected per build with the `--ssg` flag (see
 * the `build` script), exactly like ssr / spa / sor. The routes to pre-render
 * are derived from the app's own page routes, so there is nothing to keep in
 * sync here. Every builder option stays available under `builder.*` if you ever
 * want to pin the rendering mode or add extra static paths.
 */
export default defineConfig({})
