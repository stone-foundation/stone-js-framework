# Stone.js · i18n

[![npm license](https://img.shields.io/npm/l/@stone-js/i18n)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/i18n)](https://www.npmjs.com/package/@stone-js/i18n)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/i18n)](https://www.npmjs.com/package/@stone-js/i18n)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

> Framework-agnostic, cloud-native i18n for Stone.js. Drop your translations in any `i18n/<lang>/`
> directory and use them identically on the backend and the frontend. Powered by
> [i18next](https://www.i18next.com), with native `Intl` formatting.

Part of **[Stone.js](https://stonejs.dev)**, the reference implementation of the
[Continuum Architecture](https://evens-stone.github.io/continuum-manifesto/manifesto): write your
domain once, and the context (runtime, protocol, caller) applies to it at run time.

- **Isomorphic**: the same service (translation, ICU pluralization, formatting) on server and browser.
- **Per-request, concurrency-safe**: each request gets a locale-bound translator; nothing global mutates on the server.
- **Zero to your taste**: load translations by hand, or let the CLI plugin do it with zero config.
- **Agnostic core**: the runtime knows nothing of HTTP/CLI/browser and imports no `node:fs`.

## Install

```bash
npm i @stone-js/i18n
```

Then add one decorator. That is the whole setup:

```ts
import { I18n } from '@stone-js/i18n'
import { StoneApp } from '@stone-js/core'

@I18n()
@StoneApp({ name: 'my-app' })
export class Application {}
```

`@I18n()` registers the service provider (so `constructor ({ i18n })` injects it anywhere), installs
the middleware that resolves the request locale, and lets the build discover your catalogs on its own.
Options only narrow the defaults: `@I18n({ locales: ['en', 'fr'], fallbackLocale: 'en' })`.

The imperative equivalent hands the blueprint to `defineStoneApp`, exactly where the decorator form
lists it:

```ts
import { defineStoneApp } from '@stone-js/core'
import { i18nBlueprint } from '@stone-js/i18n'

export const Application = defineStoneApp(handler, { name: 'my-app' }, [i18nBlueprint])
```

## Translations layout

A catalog is any directory named `i18n`, holding `<locale>/<namespace>.<ext>` files. The simplest
project keeps one:

```
app/i18n/
├─ en/common.json   → { "hello": "Hello {{name}}!", "items_one": "{{count}} item", "items_other": "{{count}} items" }
└─ fr/common.json   → { "hello": "Bonjour {{name}} !", "items_one": "{{count}} article", "items_other": "{{count}} articles" }
```

**Catalogs are found at any depth under `app`**, so a larger codebase can keep translations next to
the code that uses them instead of in one growing directory:

```
app/
├─ i18n/                       ← shared across the app
│  ├─ en/common.json
│  └─ fr/common.json
└─ modules/
   ├─ billing/
   │  ├─ BillingService.ts
   │  └─ i18n/                 ← owned by the billing module
   │     ├─ en/invoice.json
   │     └─ fr/invoice.json
   └─ crm/contacts/i18n/fr/contact.json
```

Every catalog contributes, and **catalogs sharing a locale and a namespace merge deeply**, so several
modules can each add their own keys to a shared `common` namespace. On a conflicting key the deeper
catalog wins, which makes the outcome the same on every machine and every build. `node_modules` and
dotted directories are never scanned: a dependency's translations are not yours.

## Loading translations

**1. The CLI plugin (recommended, true zero-config).** At build time it walks `app` for every `i18n`
directory and generates the wiring for you with plain imports, so it works on every target: a backend
service (Rollup), a browser SPA and SSR (Vite) alike. No `loadTranslations(...)` line is needed. Add it
to `stone.config`:

```ts
import { i18nCliPlugin } from '@stone-js/i18n/cli'

export default defineConfig({ plugins: [i18nCliPlugin()] })
```

`@stone-js/i18n` also declares a `stone.cliPlugin` contract, so the CLI can **auto-discover** it from
your direct dependencies (announced on every build). Opt out with `autoDiscoverPlugins: false`.

**Lazy by default, no FOUC.** Catalogs are lazy by default: only the active locale's catalog is
imported on demand (code-split per file), for a lighter payload. The kernel middleware awaits it
before the handler renders, so there is never a flash of untranslated keys. Pass `lazy: false` to
bundle every locale eagerly instead:

```ts
export default defineConfig({ plugins: [i18nCliPlugin({ lazy: false })] })
```

**When the convention does not fit.** Four options, from the least to the most explicit. You need none
of them for a conventional project:

| Option | Default | What it does |
|---|---|---|
| `root` | `'app'` | The directory walked for catalogs |
| `dirname` | `'i18n'` | The directory name that marks a catalog, for example `'locales'` |
| `dir` | -- | Scan exactly this one directory, no walk, for translations kept outside `root` |
| `pattern` | -- | Take the files from a glob instead of the walk, when nothing above fits |

```ts
// Catalogs named `locales/` instead of `i18n/`, anywhere under `src`
i18nCliPlugin({ root: 'src', dirname: 'locales' })

// Full control, for a layout no convention describes
i18nCliPlugin({ pattern: 'packages/*/translations/*/*.json' })
```

Whatever a `pattern` matches must still end in `<locale>/<namespace>.<ext>`: that tail is how the
runtime knows which locale and namespace a file carries.

**2. By hand.** Set `stone.i18n.resources` yourself. On Vite targets (SPA, SSR), `import.meta.glob`
autoloads them, isomorphic and tree-shaking:

```ts
import { defineConfig } from '@stone-js/core'
import { loadTranslations } from '@stone-js/i18n'

export const AppConfig = defineConfig((blueprint) => {
  blueprint.set('stone.i18n.locales', ['en', 'fr'])
  blueprint.set(
    'stone.i18n.resources',
    loadTranslations(import.meta.glob('/app/i18n/**/*.{json,ts,js,yaml,yml}', { eager: true }))
  )
})
```

> `defineConfig` takes a **function** (or an object carrying `configure`), never a configuration
> fragment: a fragment compiles, runs, and configures nothing. There used to be a `defineI18n`
> helper returning such a fragment; it was removed, because a module is enabled either by its
> decorator (`@I18n()`) or by its blueprint (`i18nBlueprint`), and configured with `blueprint.set`.

(For a plain backend service, prefer the plugin: it emits static imports rather than `import.meta.glob`,
which only Vite understands.)

## Usage

The request locale is resolved automatically and a request-bound translator is exposed on the event.

```ts
import { translatorFor } from '@stone-js/i18n'
import { EventHandler, Get } from '@stone-js/router'

@EventHandler('/greet')
export class GreetController {
  @Get('/')
  greet (event) {
    const t = translatorFor(event)              // bound to the request locale (concurrency-safe)
    return {
      message: t.t('hello', { name: 'Ada' }),   // "Bonjour Ada !" for a fr request
      items: t.t('items', { count: 3 }),         // ICU pluralization
      price: t.currency(19.9, 'EUR'),            // "19,90 €"
      reach: t.compact(1_500_000)                // "1,5 M"
    }
  }
}
```

Or inject the service (`constructor ({ i18n })`) and bind a locale with `i18n.forLocale(locale)`.
On the frontend, switch the active locale with `await i18n.setLocale('fr')`.

## Locale resolution

Resolved in order (first match wins), each candidate negotiated against `locales` (`fr-CA` → `fr`):

1. a custom `resolver`,
2. a `:lang` **route param** (path-based locale) when `param` is set and the router is available (isomorphic),
3. custom headers `x-locale` → `x-lang` → `x-language`,
4. the `lang` query parameter,
5. the `locale` cookie,
6. the standard `Accept-Language` header,
7. the event's own locale, then `fallbackLocale`.

## Configure

Everything is optional (`stone.i18n.*`):

```ts
import { defineConfig } from '@stone-js/core'

export const AppConfig = defineConfig((blueprint) => blueprint.set('stone.i18n', {
  locale: 'en',                     // active/default locale
  locales: ['en', 'fr', 'pt-BR'],   // supported (negotiated)
  fallbackLocale: 'en',
  defaultNamespace: 'translation',
  timeZone: 'America/New_York',     // default IANA zone for date formatting (per-call overridable)
  interpolation: { prefix: '{{', suffix: '}}', escapeValue: false },
  missing: 'key',                   // 'key' | 'empty' | (key, locale, ns) => string
  onMissingKey: (key, locale, ns) => console.warn(`[i18n] missing ${locale}/${ns}: ${key}`), // dev aid
  // resolution:
  param: 'lang',                    // :lang route prefix (path-based)
  headers: ['x-locale', 'x-lang', 'x-language'],
  query: 'lang',                    // false to disable
  cookie: 'locale',                 // false to disable
  acceptLanguage: true
}))
```

## Formatting & everyday helpers

All locale-aware, all via native `Intl`:

| Method | Example (fr) |
|---|---|
| `t(key, { count, ...params })` | `t('items', { count: 3 })` -> `3 articles` |
| `number(v, opts?)` | `1 234,5` |
| `compact(v, opts?)` | `1 M` |
| `currency(v, code, opts?)` | `currency(19.9, 'EUR')` -> `19,90 €` |
| `percent(v, opts?)` | `percent(0.25)` -> `25 %` |
| `date(v, opts?)` | honours `timeZone` |
| `relativeTime(v, unit, opts?)` | `relativeTime(-3, 'day')` -> `il y a 3 jours` |
| `list(values, opts?)` | `a, b et c` |
| `dir(locale?)` | `'ltr'` / `'rtl'` (for `<html dir>`) |

## Frontend

The underlying i18next instance is bound in the container (`constructor ({ i18next })`) and available
as `i18n.raw`, so you can wire `react-i18next`, a language detector or any i18next plugin directly:

```ts
import { I18nManager } from '@stone-js/i18n'
import { initReactI18next } from 'react-i18next'

I18nManager.getInstance().raw.use(initReactI18next)
```

## License

[MIT](https://opensource.org/licenses/MIT) © Evens Pierre ("Mr. Stone") and the Stone.js contributors.
