import { createInstance, type i18n as I18nextInstance } from 'i18next'
import { I18nError } from './errors/I18nError'
import { II18n, I18nOptions, Locale, Resources, TranslateOptions, Translations } from './declarations'

/**
 * The i18n service: a thin, platform-agnostic Stone.js API over [i18next](https://www.i18next.com).
 *
 * It knows nothing about HTTP/CLI/browser. The same instance serves the whole app; per request,
 * derive a locale-bound translator with {@link forLocale} (uses i18next's `getFixedT`, so it never
 * mutates the shared instance and stays concurrency-safe on the server). On the frontend, switch
 * the active locale with {@link setLocale}. Formatting uses the native `Intl` APIs.
 */
export class I18n implements II18n {
  private static instance?: I18n

  private readonly i18next: I18nextInstance
  private readonly boundLocale?: Locale

  /**
   * @param i18next - The underlying i18next instance.
   * @param boundLocale - When set, this translator is locked to that locale (request scope).
   */
  private constructor (i18next: I18nextInstance, boundLocale?: Locale) {
    this.i18next = i18next
    this.boundLocale = boundLocale
  }

  /**
   * Create and synchronously initialise the service from its options.
   *
   * @param options - The i18n options (`stone.i18n.*`).
   * @returns A ready-to-use I18n instance.
   */
  static create (options: I18nOptions = {}): I18n {
    const instance = createInstance()
    const resources: Resources = options.resources ?? {}
    const defaultNS = options.defaultNamespace ?? 'translation'
    const missing = options.missing

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
      parseMissingKeyHandler: missing === 'empty'
        ? () => ''
        : typeof missing === 'function'
          ? (key: string): string => missing(key, instance.language, defaultNS)
          : undefined
    })

    return new I18n(instance)
  }

  /**
   * Publish a process-wide instance, so the standalone `t()` helper can reach it (frontend /
   * imperative use). The service provider calls this on registration.
   *
   * @param instance - The instance to publish.
   */
  static setInstance (instance: I18n): void {
    I18n.instance = instance
  }

  /**
   * The process-wide instance.
   *
   * @returns The published instance.
   * @throws {I18nError} When no instance has been published yet.
   */
  static getInstance (): I18n {
    if (I18n.instance === undefined) {
      throw new I18nError('No i18n instance available. Register `i18nBlueprint` first.')
    }
    return I18n.instance
  }

  /** The locale this translator resolves against. */
  get locale (): Locale {
    return this.getLocale()
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
  forLocale (locale: Locale): I18n {
    return new I18n(this.i18next, locale)
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
   * Format a date for the active locale.
   *
   * @param value - A `Date`, timestamp or date string.
   * @param options - `Intl.DateTimeFormat` options.
   * @returns The formatted date.
   */
  date (value: Date | number | string, options?: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat(this.getLocale(), options).format(new Date(value))
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
