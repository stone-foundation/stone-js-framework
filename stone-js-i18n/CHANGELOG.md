# @stone-js/i18n

## 0.8.9

### Patch Changes

- 5e01789: fix(i18n): the zero-config path actually works, and `@I18n()` enables it in one line

  Verified end to end on a real app (`@I18n()` + `app/i18n/<locale>/translation.json`, nothing else): the catalogs are discovered, the locale is resolved from the request, and translations render. Three defects stood between the module and that promise, each of which alone made every translation return its key, which reads exactly like a missing catalogue.

  - **The CLI plugin was never discovered.** Auto-discovery reads the default export of the bundle named by `stone.cliPlugin`, and `multi-entry` re-exports named exports only, so the plugin's `export default` silently vanished from `dist/cli.js`. The shared build gained a `multiEntry` opt-out, which the CLI-plugin build now uses.
  - **The generated module configured nothing.** It emitted `defineConfig(defineI18n({...}))`, but `defineI18n` returns an unwrapped `{ i18n }` fragment while `defineConfig` expects a function or an object carrying `configure`, so `configure` resolved to a no-op. It now emits a plain `stone`-wrapped blueprint, which the module scan applies directly. The README and docs page taught the same broken pattern and are corrected.
  - **Lazy catalogs broke the server build.** Lazy loaders are dynamic imports, and a server artefact is a single file, so Rollup failed with "when building multiple chunks, the output.dir option must be used". Server outputs now set `inlineDynamicImports`, which fixes any dynamic import in an app, not only i18n.

  **New `@I18n()` decorator**, matching every other module (`@Cache`, `@Realtime`, `@Queue`). The service class is renamed `I18nManager` to free the bare name, exactly as `CacheManager` and `RealtimeManager` do: update `I18n` to `I18nManager` where you import the service (the container aliases `i18n` / `I18n` are unchanged, so `constructor ({ i18n })` keeps working).

- 5e01789: feat(i18n): catalogues are found at any depth, and overlapping ones merge

  Discovery scanned `app/i18n` and nothing else, which forced every translation of
  an application into one flat directory. A catalogue is now **any directory named
  `i18n` under `app`**, found at any depth, so translations can live next to the
  code that owns them:

  ```
  app/i18n/fr/common.json                     shared across the app
  app/modules/billing/i18n/fr/invoice.json    owned by the billing module
  app/modules/crm/contacts/i18n/fr/contact.json
  ```

  Which makes overlapping catalogues the normal case, and revealed a silent data
  loss: `loadTranslations` did `resources[locale][namespace] = ...`, so a shared
  `fr/common.json` and a module's own `fr/common.json` left only the last one
  standing. Catalogues sharing a locale and a namespace now **deep-merge**, applied
  in sorted path order, so the deeper catalogue wins a conflicting key and the
  result is identical on every machine and every build. The lazy path already
  merged through i18next but applied its bundles inside `Promise.all`, letting
  import timing decide the winner; imports stay parallel, the merge is ordered.

  Four plugin options cover what the convention cannot express, none of them needed
  by a conventional project:

  | Option    | Default  | What it does                                                       |
  | --------- | -------- | ------------------------------------------------------------------ |
  | `root`    | `'app'`  | The directory walked for catalogues                                |
  | `dirname` | `'i18n'` | The directory name that marks a catalogue, for example `'locales'` |
  | `dir`     | --       | Scan exactly this one directory, no walk                           |
  | `pattern` | --       | Take the files from a glob, when nothing above fits                |

  ```ts
  i18nCliPlugin({ root: "src", dirname: "locales" });
  i18nCliPlugin({ pattern: "packages/*/translations/*/*.json" });
  ```

  `node_modules` and dotted directories are excluded from the walk and from
  `pattern`, because a dependency's translations are not your application's.

- 5e01789: **Breaking (pre-1.0)**: removed `defineI18n`, `defineCache`, `defineQueue`, `defineRealtime`, `defineEventBus` and `defineKeyRouting`

  A module is enabled in exactly two ways, and that is a universal rule of the framework: its **decorator** for the declarative API (`@I18n()`, `@Cache()`, `@Queue()`, `@Realtime()`, `@EventBus()`, `@KeyRouting()`), or its **blueprint** handed to the app manifest for the imperative one, `defineStoneApp(handler, options, [i18nBlueprint])`, which is the exact counterpart of `@StoneApp(options, [i18nBlueprint])`. These six helpers were a third path that enabled nothing: each returned an unwrapped configuration fragment (`{ i18n: … }`), and the pattern every README and docs page showed for them, `defineConfig(defineX({...}))`, **configured nothing at all**. `defineConfig` expects a function or an object carrying `configure`; handed a fragment it falls back to an empty `configure`, silently. That is what made the i18n catalogs never load.

  **Migration**: enable with the decorator or the blueprint, and configure with `blueprint.set`:

  ```ts
  // before (compiled, ran, configured nothing)
  export const AppConfig = defineConfig(defineCache({ default: 'redis', stores: [...] }))

  // after: enable on the manifest, configure with blueprint.set
  export const Application = defineStoneApp(handler, { name: 'my-app' }, [cacheBlueprint])

  export const AppConfig = defineConfig((blueprint) => blueprint.set('stone.cache', {
    default: 'redis',
    stores: [...]
  }))
  ```

  READMEs and documentation pages are updated accordingly. `defineJobHandler` and `defineKeyRoute` are untouched: they declare a module, not a configuration bucket, and keep their imperative role next to `@JobHandler` and `@KeyRoute`.

- f6d9fe4: fix(build): published declarations carry explicit `.js` extensions

  Our sources are bundler-style (extensionless relative imports) and `tsc` reproduces what they wrote. In a published ESM package with an `exports` map, a consumer on `moduleResolution: nodenext` cannot resolve those specifiers, so the types of everything they re-export become **invisible**. The reported symptom was misleading: `error TS2305: Module '"@stone-js/use-react"' has no exported member 'useContainer'`, which reads as "the hook does not exist" rather than "the module was not resolved". A pilot project hit it on `@stone-js/use-react` and worked around it with `moduleResolution: "bundler"`, which is right for bundled code but wrong for a pure Node ESM consumer.

  The shared build now rewrites relative specifiers in every emitted declaration (`<file>.js`, or `<dir>/index.js` for a directory), and the generated barrel emits them the same way. `@stone-js/use-view`, which carries its own rollup config, was wired to the same plugin.

  Verified across 635 declaration files: zero extensionless relative imports, and a `moduleResolution: nodenext` consumer importing `useContainer` / `useBlueprint` typechecks clean where it previously reported 138 errors. A `pnpm run check:dts` guard runs in CI right after the build so this cannot regress, including for a package that grows its own build config.

- Updated dependencies [0629318]
- Updated dependencies [8b2bd5d]
- Updated dependencies [6584764]
- Updated dependencies [caf14e3]
- Updated dependencies [f6d9fe4]
- Updated dependencies [e507985]
- Updated dependencies [2ed390b]
  - @stone-js/config@0.8.9
  - @stone-js/core@0.8.9

## 0.8.8

### Patch Changes

- @stone-js/core@0.8.8

## 0.8.7

### Patch Changes

- @stone-js/core@0.8.7

## 0.8.6

### Patch Changes

- 0fdf8c8: New module: `@stone-js/i18n` — framework-agnostic, cloud-native internationalization for Stone.js,
  powered by i18next with native `Intl` formatting. Zero-config: drop translations in
  `app/i18n/<locale>/<namespace>.json` and they load automatically. The request locale is resolved
  per request (custom `x-locale`/`x-lang`/`x-language` headers → query → cookie → standard
  `Accept-Language` negotiation), and a concurrency-safe, request-bound translator is exposed on the
  event. Isomorphic: the same service (translation, ICU pluralization, number/date/relative/list
  formatting) runs on the backend and the frontend.
  - @stone-js/core@0.8.6
