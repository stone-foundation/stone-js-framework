import { Promiseable } from '@stone-js/core'

/** A BCP-47 language tag, e.g. `en`, `fr`, `pt-BR`. */
export type Locale = string

/** A namespace's translation tree (nested keys allowed). */
export type Translations = Record<string, unknown>

/** All namespaces for a single locale, e.g. `{ common: {...}, auth: {...} }`. */
export type LocaleResources = Record<string, Translations>

/** The full resource map: `{ en: { common: {...} }, fr: { common: {...} } }`. */
export type Resources = Record<Locale, LocaleResources>

/**
 * Options for a single translation lookup. Any extra key is an interpolation value, so
 * `t('hello', { name: 'Ada' })` fills `{{name}}` and `t('items', { count: 3 })` selects the plural.
 */
export interface TranslateOptions {
  /** Plural selector (drives `Intl.PluralRules` categories: zero/one/two/few/many/other). */
  count?: number
  /** Fallback returned when the key is missing. */
  defaultValue?: string
  /** Namespace to look the key up in (defaults to `defaultNamespace`). */
  ns?: string
  /** One-off locale override for this lookup. */
  locale?: Locale
  /** Interpolation values. */
  [param: string]: unknown
}

/**
 * The translator contract. The same shape is used app-wide and per request (a request-scoped,
 * locale-bound translator obtained via {@link II18n.forLocale}).
 */
export interface II18n {
  /** The locale this translator resolves against. */
  readonly locale: Locale

  /** Translate `key`, with interpolation, pluralization and fallback. */
  t: (key: string, options?: TranslateOptions) => string

  /** Whether `key` exists (in the current/overridden locale + namespace). */
  has: (key: string, options?: { ns?: string, locale?: Locale }) => boolean

  /** The current locale. */
  getLocale: () => Locale

  /** Change the active locale (frontend / single-user contexts). */
  setLocale: (locale: Locale) => Promiseable<void>

  /** A request-scoped translator bound to `locale`, without mutating the shared instance. */
  forLocale: (locale: Locale) => II18n

  /** Register/merge a namespace bundle at runtime. */
  addResources: (locale: Locale, namespace: string, resources: Translations) => void

  /** Lazily load a locale's catalog (and the fallback's) into the shared instance; no-op unless lazy loaders were configured. */
  loadLocale: (locale: Locale) => Promiseable<void>

  /** Format a number with `Intl.NumberFormat` for the active locale. */
  number: (value: number, options?: Intl.NumberFormatOptions) => string

  /** Format a number in compact notation (1000 → "1K", 1.5e6 → "1.5M"), locale-aware. */
  compact: (value: number, options?: Intl.NumberFormatOptions) => string

  /** Format a monetary amount (e.g. `currency(19.9, 'EUR')` → "19,90 €" in fr). */
  currency: (value: number, currency: string, options?: Intl.NumberFormatOptions) => string

  /** Format a ratio as a percentage (e.g. `percent(0.25)` → "25%"). */
  percent: (value: number, options?: Intl.NumberFormatOptions) => string

  /** The writing direction of a locale (`'rtl'` for Arabic/Hebrew/…, else `'ltr'`) — for `<html dir>`. */
  dir: (locale?: Locale) => 'ltr' | 'rtl'

  /** Format a date with `Intl.DateTimeFormat` for the active locale. */
  date: (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => string

  /** Format a relative time (e.g. "in 3 days") with `Intl.RelativeTimeFormat`. */
  relativeTime: (value: number, unit: Intl.RelativeTimeFormatUnit, options?: Intl.RelativeTimeFormatOptions) => string

  /** Format a list (e.g. "a, b and c") with `Intl.ListFormat`. */
  list: (values: Iterable<string>, options?: Intl.ListFormatOptions) => string
}

/**
 * A minimal, duck-typed view of an incoming event, so locale resolution stays platform-agnostic
 * (it never imports `@stone-js/http-core`). Any accessor may be absent on non-HTTP events.
 */
export interface LocaleAwareEvent {
  /** The event's own locale (the core `IncomingEvent` carries one). */
  locale?: Locale
  /** Generic accessor (route params → body → query → metadata). */
  get?: <T = unknown>(key: string, fallback?: T) => T
  /** Route parameter accessor (kernel-trusted; available once routing has run). */
  getParam?: <T = string>(name: string, fallback?: T) => T | undefined
  /** HTTP header accessor. */
  getHeader?: <T = string>(name: string, fallback?: T) => T | undefined
  /** HTTP cookie accessor. */
  getCookie?: <T = string>(name: string, fallback?: T) => T | undefined
  /** HTTP `Accept-Language` content negotiation. */
  acceptsLanguages?: (...values: string[]) => { value?: string } | string | undefined
}

/** Full escape hatch: derive the locale from the event yourself. */
export type LocaleResolver = (event: LocaleAwareEvent, options: LocaleResolutionOptions) => Locale | undefined

/**
 * How the per-request locale is resolved, in order: custom headers → query → cookie → the standard
 * `Accept-Language` negotiation → the event's own locale → `fallbackLocale`.
 */
export interface LocaleResolutionOptions {
  /** The supported locales, used to negotiate/validate a resolved candidate. */
  locales?: Locale[]
  /** The fallback locale when nothing resolves. */
  fallbackLocale?: Locale
  /** Route parameter checked first (e.g. `'lang'` for a `:lang` path prefix). Opt-in; needs routing. */
  param?: string
  /** Custom request headers checked next, in order. Default `['x-locale', 'x-lang', 'x-language']`. */
  headers?: string[]
  /** Query-string parameter checked next. Default `'lang'`. `false` disables it. */
  query?: string | false
  /** Cookie checked next. Default `'locale'`. `false` disables it. */
  cookie?: string | false
  /** Whether to negotiate the standard `Accept-Language` header. Default `true`. */
  acceptLanguage?: boolean
  /** Full escape hatch. */
  resolver?: LocaleResolver
}

/**
 * i18n configuration (`stone.i18n.*`).
 */
export interface I18nOptions extends Omit<LocaleResolutionOptions, 'fallbackLocale'> {
  /** The default/active locale. Default `'en'`. */
  locale?: Locale
  /** The fallback locale(s) for missing keys. Default `'en'`. */
  fallbackLocale?: Locale | Locale[]
  /** The default namespace. Default `'translation'`. */
  defaultNamespace?: string
  /** Default IANA time zone for date formatting (e.g. `'America/New_York'`). Per-call overridable. */
  timeZone?: string
  /** Eager resources; merged over the zero-config `app/i18n` scan. */
  resources?: Resources
  /**
   * Lazy catalog loaders: a `path -> () => import(...)` map (a non-eager `import.meta.glob`).
   * Only the active locale's catalog is imported, on demand, awaited before render (no FOUC).
   */
  loaders?: Record<string, () => Promise<unknown>>
  /** The directory scanned for zero-config translations (Node). Default `'app/i18n'`. */
  dir?: string | false
  /** Interpolation delimiters. Default `{ prefix: '{{', suffix: '}}' }`. */
  interpolation?: { prefix?: string, suffix?: string, escapeValue?: boolean }
  /** What to return for a missing key: `'key'` (the key), `'empty'`, or a custom renderer. */
  missing?: 'key' | 'empty' | ((key: string, locale: Locale, ns: string) => string)
  /** Dev aid: called whenever a key is missing, so you can log/collect untranslated keys. */
  onMissingKey?: (key: string, locale: Locale, ns: string) => void
}
