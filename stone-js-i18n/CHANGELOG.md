# @stone-js/i18n

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
