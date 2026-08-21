import { createInstance, type i18n as I18nextInstance } from 'i18next'
import { I18nError } from './errors/I18nError'
import { normalizeTranslations, parseResourcePath } from './loadTranslations'
import { II18n, I18nOptions, Locale, Resources, TranslateOptions, Translations } from './declarations'

/** A lazy catalog loader map: `path -> () => import(...)`. */
type LocaleLoaders = Record<string, () => Promise<unknown>>

/**
 * The i18n service: a thin, platform-agnostic Stone.js API over [i18next](https://www.i18next.com).
 *
 * It knows nothing about HTTP/CLI/browser. The same instance serves the whole app; per request,
 * derive a locale-bound translator with {@link forLocale} (uses i18next's `getFixedT`, so it never
 * mutates the shared instance and stays concurrency-safe on the server). On the frontend, switch
 * the active locale with {@link setLocale}. Formatting uses the native `Intl` APIs.
 */
export class I18nManager implements II18n {
  private static instance?: I18nManager

  private readonly i18next: I18nextInstance
  private readonly boundLocale?: Locale
  private readonly timeZone?: string
  private readonly loaders?: LocaleLoaders
  private readonly loaded: Set<Locale>
  private readonly fallbackLocale?: Locale
  private readonly declaredLocale: Locale

  /**
   * @param i18next - The underlying i18next instance.
   * @param boundLocale - When set, this translator is locked to that locale (request scope).
   * @param timeZone - Default IANA time zone for date formatting.
   * @param loaders - Lazy catalog loaders (a non-eager `import.meta.glob` map), shared across clones.
   * @param loaded - The set of locales already loaded, shared across clones so a catalog loads once.
   * @param fallbackLocale - The fallback locale, loaded alongside the active one for cross-locale fallback.
   */
  private constructor (
    i18next: I18nextInstance,
    boundLocale?: Locale,
    timeZone?: string,
    loaders?: LocaleLoaders,
    loaded?: Set<Locale>,
    fallbackLocale?: Locale,
    configuredLocale?: Locale
  ) {
    this.i18next = i18next
    this.boundLocale = boundLocale
    this.timeZone = timeZone
    this.loaders = loaders
    this.loaded = loaded ?? new Set<Locale>()
    this.fallbackLocale = fallbackLocale
    this.declaredLocale = configuredLocale ?? i18next.language
  }

  /**
   * The locale the application was configured with, which never moves.
   *
   * Distinct from {@link getLocale}, which answers what is active now: moving the instance to a
   * caller's language must not turn that caller's language into the next one's default. Anything
   * choosing a last resort reads this, not the live value.
   *
   * @returns The configured locale.
   */
  get configuredLocale (): Locale {
    return this.declaredLocale
  }

  /**
   * Create and synchronously initialise the service from its options.
   *
   * @param options - The i18n options (`stone.i18n.*`).
   * @returns A ready-to-use I18nManager instance.
   */
  static create (options: I18nOptions = {}): I18nManager {
    const instance = createInstance()
    const resources: Resources = options.resources ?? {}
    const defaultNS = options.defaultNamespace ?? 'translation'
    const missing = options.missing
    const onMissingKey = options.onMissingKey

    const fallback = Array.isArray(options.fallbackLocale) ? options.fallbackLocale[0] : options.fallbackLocale

    let parseMissingKeyHandler: ((key: string) => string) | undefined
    if (missing === 'empty') {
      parseMissingKeyHandler = () => ''
    } else if (typeof missing === 'function') {
      parseMissingKeyHandler = (key: string): string => missing(key, instance.language, defaultNS)
    }

    void instance.init({
      lng: options.locale ?? 'en',
      fallbackLng: options.fallbackLocale ?? 'en',
      defaultNS,
      ns: collectNamespaces(resources, defaultNS),
      resources: resources as Record<string, Record<string, Translations>>,
      initImmediate: false,
      returnNull: false,
      showSupportNotice: false,
      interpolation: {
        prefix: options.interpolation?.prefix ?? '{{',
        suffix: options.interpolation?.suffix ?? '}}',
        escapeValue: options.interpolation?.escapeValue ?? false
      },
      parseMissingKeyHandler,
      // Dev aid: notify on missing keys so untranslated strings surface during development.
      saveMissing: onMissingKey !== undefined,
      missingKeyHandler: onMissingKey !== undefined
        ? (lngs: readonly string[], ns: string, key: string): void => onMissingKey(key, lngs[0], ns)
        : undefined
    })

    return new I18nManager(instance, undefined, options.timeZone, options.loaders, undefined, fallback, instance.language)
  }

  /**
   * Publish a process-wide instance, so the standalone `t()` helper can reach it (frontend /
   * imperative use). The service provider calls this on registration.
   *
   * @param instance - The instance to publish.
   */
  static setInstance (instance: I18nManager): void {
    I18nManager.instance = instance
  }

  /**
   * The process-wide instance.
   *
   * @returns The published instance.
   * @throws {I18nError} When no instance has been published yet.
   */
  static getInstance (): I18nManager {
    if (I18nManager.instance === undefined) {
      throw new I18nError('No i18n instance available. Register `i18nBlueprint` first.')
    }
    return I18nManager.instance
  }

  /** The locale this translator resolves against. */
  get locale (): Locale {
    return this.getLocale()
  }

  /** The underlying i18next instance, for direct/advanced use (also bound in the container as `i18next`). */
  get raw (): I18nextInstance {
    return this.i18next
  }

  /**
   * Translate `key`, with interpolation, pluralization (`count`) and fallback.
   *
   * @param key - The translation key (optionally `namespace:key`).
   * @param options - Interpolation values, `count`, `ns`, `defaultValue`, one-off `locale`.
   * @returns The translated string.
   */
  t (key: string, options: TranslateOptions = {}): string {
    const { locale, ns, ...rest } = options
    const fixedT = this.i18next.getFixedT(locale ?? this.getLocale(), ns ?? null)
    return String(fixedT(key, rest))
  }

  /**
   * Whether `key` exists for the resolved locale and namespace.
   *
   * @param key - The translation key.
   * @param options - Optional `ns` and `locale` overrides.
   * @returns True when the key resolves.
   */
  has (key: string, options: { ns?: string, locale?: Locale } = {}): boolean {
    return this.i18next.exists(key, { lng: options.locale ?? this.getLocale(), ns: options.ns })
  }

  /**
   * The current locale (the bound one, or the shared instance's active language).
   *
   * @returns The locale.
   */
  getLocale (): Locale {
    return this.boundLocale ?? this.i18next.language
  }

  /**
   * Change the active locale of the shared instance (frontend / single-user contexts).
   *
   * @param locale - The new locale.
   */
  async setLocale (locale: Locale): Promise<void> {
    await this.i18next.changeLanguage(locale)
  }

  /**
   * A request-scoped translator bound to `locale`, without mutating the shared instance.
   *
   * @param locale - The locale to bind.
   * @returns A locale-bound translator.
   */
  forLocale (locale: Locale): I18nManager {
    return new I18nManager(this.i18next, locale, this.timeZone, this.loaders, this.loaded, this.fallbackLocale, this.declaredLocale)
  }

  /**
   * Lazily load a locale's catalog (and the fallback locale's) into the shared instance.
   *
   * A no-op unless lazy {@link I18nOptions.loaders} were configured. It imports only the files that
   * belong to `locale` (and, once, the fallback locale), on demand, and merges them via
   * {@link addResources}. Because {@link SetLocaleMiddleware} awaits it before the handler runs, the
   * active catalog is present at first render, so there is no flash of untranslated keys. Idempotent:
   * a locale is loaded at most once, and dynamic imports are memoised by the runtime.
   *
   * @param locale - The locale to load.
   */
  async loadLocale (locale: Locale): Promise<void> {
    if (this.loaders === undefined) { return }
    await this.loadCatalog(locale)
    if (this.fallbackLocale !== undefined && this.fallbackLocale !== locale) {
      await this.loadCatalog(this.fallbackLocale)
    }
  }

  /**
   * Import and merge every lazy loader that belongs to a single locale, once.
   *
   * @param locale - The locale to load.
   */
  private async loadCatalog (locale: Locale): Promise<void> {
    if (this.loaders === undefined || this.loaded.has(locale)) { return }

    const matched = Object.entries(this.loaders)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([path, load]) => ({ parsed: parseResourcePath(path), load }))
      .filter((entry): entry is { parsed: { locale: Locale, namespace: string }, load: () => Promise<unknown> } =>
        entry.parsed?.locale === locale)

    // Imported in parallel, merged in path order: two catalogues can carry the same namespace for a
    // locale (a shared `common` plus a module's own), and a conflicting key must not resolve by
    // whichever import happened to settle first.
    const bundles = await Promise.all(matched.map(async ({ parsed, load }) => ({
      namespace: parsed.namespace, translations: normalizeTranslations(await load())
    })))

    for (const { namespace, translations } of bundles) {
      this.addResources(locale, namespace, translations)
    }

    this.loaded.add(locale)
  }

  /**
   * Register or merge a namespace bundle at runtime.
   *
   * @param locale - The locale.
   * @param namespace - The namespace.
   * @param resources - The translations to merge.
   */
  addResources (locale: Locale, namespace: string, resources: Translations): void {
    this.i18next.addResourceBundle(locale, namespace, resources, true, true)
  }

  /**
   * Format a number for the active locale.
   *
   * @param value - The number.
   * @param options - `Intl.NumberFormat` options.
   * @returns The formatted number.
   */
  number (value: number, options?: Intl.NumberFormatOptions): string {
    return new Intl.NumberFormat(this.getLocale(), options).format(value)
  }

  /**
   * Format a number in compact notation (1000 → "1K", 1.5e6 → "1.5M"), locale-aware.
   *
   * @param value - The number.
   * @param options - `Intl.NumberFormat` options.
   * @returns The compact number.
   */
  compact (value: number, options?: Intl.NumberFormatOptions): string {
    return this.number(value, { notation: 'compact', ...options })
  }

  /**
   * Format a monetary amount for the active locale.
   *
   * @param value - The amount.
   * @param currency - The ISO 4217 currency code (e.g. `'EUR'`).
   * @param options - `Intl.NumberFormat` options.
   * @returns The formatted amount.
   */
  currency (value: number, currency: string, options?: Intl.NumberFormatOptions): string {
    return this.number(value, { style: 'currency', currency, ...options })
  }

  /**
   * Format a ratio as a percentage (e.g. `percent(0.25)` → "25%").
   *
   * @param value - The ratio (0–1).
   * @param options - `Intl.NumberFormat` options.
   * @returns The formatted percentage.
   */
  percent (value: number, options?: Intl.NumberFormatOptions): string {
    return this.number(value, { style: 'percent', ...options })
  }

  /**
   * The writing direction of a locale — `'rtl'` for Arabic/Hebrew/Farsi/Urdu/…, otherwise `'ltr'`.
   * Use it for the document's `dir` attribute.
   *
   * @param locale - The locale (defaults to the active one).
   * @returns The direction.
   */
  dir (locale: Locale = this.getLocale()): 'ltr' | 'rtl' {
    return RTL_LANGUAGES.has(locale.split('-')[0].toLowerCase()) ? 'rtl' : 'ltr'
  }

  /**
   * Format a date for the active locale.
   *
   * @param value - A `Date`, timestamp or date string.
   * @param options - `Intl.DateTimeFormat` options.
   * @returns The formatted date.
   */
  date (value: Date | number | string, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.getLocale(), { timeZone: this.timeZone, ...options }).format(new Date(value))
  }

  /**
   * Format a relative time (e.g. "in 3 days") for the active locale.
   *
   * @param value - The signed amount.
   * @param unit - The unit (e.g. `'day'`).
   * @param options - `Intl.RelativeTimeFormat` options.
   * @returns The formatted relative time.
   */
  relativeTime (value: number, unit: Intl.RelativeTimeFormatUnit, options?: Intl.RelativeTimeFormatOptions): string {
    return new Intl.RelativeTimeFormat(this.getLocale(), options).format(value, unit)
  }

  /**
   * Format a list (e.g. "a, b and c") for the active locale.
   *
   * @param values - The list items.
   * @param options - `Intl.ListFormat` options.
   * @returns The formatted list.
   */
  list (values: Iterable<string>, options?: Intl.ListFormatOptions): string {
    return new Intl.ListFormat(this.getLocale(), options).format(values)
  }
}

/** Base languages written right-to-left. */
const RTL_LANGUAGES = new Set(['ar', 'he', 'fa', 'ur', 'ps', 'sd', 'ug', 'yi', 'dv', 'ckb'])

/**
 * Collect every namespace present across all locales, always including the default one.
 *
 * @param resources - The resource map.
 * @param defaultNS - The default namespace.
 * @returns The unique namespace list.
 */
export function collectNamespaces (resources: Resources, defaultNS: string): string[] {
  const namespaces = new Set<string>([defaultNS])
  for (const locale of Object.values(resources)) {
    for (const namespace of Object.keys(locale)) {
      namespaces.add(namespace)
    }
  }
  return [...namespaces]
}
