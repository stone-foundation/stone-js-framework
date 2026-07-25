# Stone.js · i18n

[![npm license](https://img.shields.io/npm/l/@stone-js/i18n)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/i18n)](https://www.npmjs.com/package/@stone-js/i18n)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/i18n)](https://www.npmjs.com/package/@stone-js/i18n)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

> Framework-agnostic, cloud-native i18n for Stone.js. Zero-config: drop your translations in
> `app/i18n/<lang>/` and use them identically on the backend and the frontend. Powered by
> [i18next](https://www.i18next.com), with native `Intl` formatting.

Part of **[Stone.js](https://stonejs.dev)**, the reference implementation of the
[Continuum Architecture](https://evens-stone.github.io/continuum-manifesto/manifesto): write your
domain once, and the context (runtime, protocol, caller) applies to it at run time.

## Install

```bash
npm i @stone-js/i18n
```

## Zero-config

Lay your translations out as `app/i18n/<locale>/<namespace>.<ext>`:

```
app/i18n/
├─ en/common.json   → { "hello": "Hello {{name}}!", "items_one": "{{count}} item", "items_other": "{{count}} items" }
└─ fr/common.json   → { "hello": "Bonjour {{name}} !", "items_one": "{{count}} article", "items_other": "{{count}} articles" }
```

Load them with one bundler-driven line — **the same on the backend and the frontend** (all formats,
tree-shakeable, no `node:fs`):

```ts
import { defineI18n, loadTranslations } from '@stone-js/i18n'

export const AppConfig = defineConfig(defineI18n({
  locales: ['en', 'fr'],
  resources: loadTranslations(import.meta.glob('/app/i18n/**/*.{json,ts,js,yaml,yml}', { eager: true }))
}))
```

Then register the blueprint (opt-in): `import { i18nBlueprint } from '@stone-js/i18n'`.

## Usage

The request locale is resolved automatically (custom header → query → cookie → `Accept-Language`)
and a request-bound translator is available on the event — no global state, concurrency-safe.

```ts
import { translatorFor } from '@stone-js/i18n'
import { EventHandler, Get } from '@stone-js/router'

@EventHandler('/greet')
export class GreetController {
  @Get('/')
  greet (event) {
    const t = translatorFor(event)          // bound to the request locale
    return {
      message: t.t('hello', { name: 'Ada' }), // "Bonjour Ada !" for a fr request
      items: t.t('items', { count: 3 }),       // ICU pluralization via Intl.PluralRules
      price: t.number(19.9, { style: 'currency', currency: 'EUR' })
    }
  }
}
```

Inject the service directly (`constructor ({ i18n })`) and derive a translator with
`i18n.forLocale(locale)`, or on the frontend switch the active locale with `await i18n.setLocale('fr')`.

## Configure

Everything is optional (`stone.i18n.*`); use `defineI18n` for imperative config:

```ts
import { defineI18n } from '@stone-js/i18n'

export const AppConfig = defineConfig(defineI18n({
  locale: 'en',
  locales: ['en', 'fr', 'pt-BR'],   // negotiated (fr-CA → fr)
  fallbackLocale: 'en',
  timeZone: 'America/New_York',      // default IANA time zone for date formatting (per-call overridable)
  // Locale resolution order is configurable:
  param: 'lang',                     // a `:lang` route param (path-based locale), checked first
  headers: ['x-locale', 'x-lang', 'x-language'], // custom headers
  query: 'lang',                     // ?lang=fr   (false to disable)
  cookie: 'locale',                  // (false to disable)
  acceptLanguage: true               // standard Accept-Language negotiation
}))
```

The underlying i18next instance is also bound in the container (`constructor ({ i18next })`) and
available as `i18n.raw`, so you can wire `react-i18next`, plugins or backends directly if you need to.

## License

[MIT](https://opensource.org/licenses/MIT) © Evens Pierre ("Mr. Stone") and the Stone.js contributors.
