---
"@stone-js/i18n": patch
"@stone-js/cache": patch
"@stone-js/queue": patch
"@stone-js/realtime": patch
"@stone-js/event-bus": patch
---

**Breaking (pre-1.0)**: removed `defineI18n`, `defineCache`, `defineQueue`, `defineRealtime` and `defineEventBus`

A module is enabled in exactly two ways, and that is a universal rule of the framework: its **decorator** for the declarative API (`@I18n()`, `@Cache()`, `@Queue()`, `@Realtime()`, `@EventBus()`), or its **blueprint** for the imperative one (`i18nBlueprint`, `cacheBlueprint`, …). These five helpers were a third path that enabled nothing: each returned an unwrapped configuration fragment (`{ i18n: … }`), and the pattern every README and docs page showed for them, `defineConfig(defineX({...}))`, **configured nothing at all**. `defineConfig` expects a function or an object carrying `configure`; handed a fragment it falls back to an empty `configure`, silently. That is what made the i18n catalogs never load.

**Migration**: enable with the decorator or the blueprint, and configure with `blueprint.set`:

```ts
// before (compiled, ran, configured nothing)
export const AppConfig = defineConfig(defineCache({ default: 'redis', stores: [...] }))

// after
export const AppConfig = defineConfig((blueprint) => blueprint.set('stone.cache', {
  default: 'redis',
  stores: [...]
}))
```

READMEs and documentation pages are updated accordingly. `defineJobHandler` is untouched: it declares a module, not a configuration bucket, and it keeps its imperative role next to `@JobHandler`.
