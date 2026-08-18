---
"@stone-js/i18n": patch
"@stone-js/cache": patch
"@stone-js/queue": patch
"@stone-js/realtime": patch
"@stone-js/event-bus": patch
"@stone-js/router": patch
---

**Breaking (pre-1.0)**: removed `defineI18n`, `defineCache`, `defineQueue`, `defineRealtime`, `defineEventBus` and `defineKeyRouting`

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
