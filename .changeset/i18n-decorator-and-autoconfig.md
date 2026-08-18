---
"@stone-js/i18n": patch
"@stone-js/cli": patch
---

fix(i18n): the zero-config path actually works, and `@I18n()` enables it in one line

Verified end to end on a real app (`@I18n()` + `app/i18n/<locale>/translation.json`, nothing else): the catalogs are discovered, the locale is resolved from the request, and translations render. Three defects stood between the module and that promise, each of which alone made every translation return its key, which reads exactly like a missing catalogue.

- **The CLI plugin was never discovered.** Auto-discovery reads the default export of the bundle named by `stone.cliPlugin`, and `multi-entry` re-exports named exports only, so the plugin's `export default` silently vanished from `dist/cli.js`. The shared build gained a `multiEntry` opt-out, which the CLI-plugin build now uses.
- **The generated module configured nothing.** It emitted `defineConfig(defineI18n({...}))`, but `defineI18n` returns an unwrapped `{ i18n }` fragment while `defineConfig` expects a function or an object carrying `configure`, so `configure` resolved to a no-op. It now emits a plain `stone`-wrapped blueprint, which the module scan applies directly. The README and docs page taught the same broken pattern and are corrected.
- **Lazy catalogs broke the server build.** Lazy loaders are dynamic imports, and a server artefact is a single file, so Rollup failed with "when building multiple chunks, the output.dir option must be used". Server outputs now set `inlineDynamicImports`, which fixes any dynamic import in an app, not only i18n.

**New `@I18n()` decorator**, matching every other module (`@Cache`, `@Realtime`, `@Queue`). The service class is renamed `I18nManager` to free the bare name, exactly as `CacheManager` and `RealtimeManager` do: update `I18n` to `I18nManager` where you import the service (the container aliases `i18n` / `I18n` are unchanged, so `constructor ({ i18n })` keeps working).
