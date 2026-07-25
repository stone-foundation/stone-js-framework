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

  /** Format a number with `Intl.NumberFormat` for the active locale. */
  number: (value: number, options?: Intl.NumberFormatOptions) => string

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
  /** Generic accessor (query/body/params). */
  get?: <T = unknown>(key: string, fallback?: T) => T
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
  /** Custom request headers checked first, in order. Default `['x-locale', 'x-lang', 'x-language']`. */
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
  /** Eager resources; merged over the zero-config `app/i18n` scan. */
  resources?: Resources
  /** The directory scanned for zero-config translations (Node). Default `'app/i18n'`. */
  dir?: string | false
  /** Interpolation delimiters. Default `{ prefix: '{{', suffix: '}}' }`. */
  interpolation?: { prefix?: string, suffix?: string, escapeValue?: boolean }
  /** What to return for a missing key: `'key'` (the key), `'empty'`, or a custom renderer. */
  missing?: 'key' | 'empty' | ((key: string, locale: Locale, ns: string) => string)
}
