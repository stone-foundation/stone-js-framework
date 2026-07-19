/**
 * Internationalization foundation.
 *
 * The site ships in English first. This module is the single seam a second
 * language plugs into: it declares the supported locales and the URL scheme, so
 * the day a translation exists, only the content and the route registration
 * change, never the call sites.
 *
 * Planned scheme: the default locale stays at the root (`/docs/...`); every other
 * locale is prefixed (`/fr/docs/...`). `localizedPath` and `stripLocale` are the
 * two helpers the future locale-aware router and language switcher will use.
 */

export type Locale = 'en' | 'fr'

export const DEFAULT_LOCALE: Locale = 'en'

export interface LocaleMeta { code: Locale, label: string, ready: boolean }

/** Supported locales. `ready` flips on when a locale's content is complete. */
export const LOCALES: LocaleMeta[] = [
  { code: 'en', label: 'English', ready: true },
  { code: 'fr', label: 'Français', ready: false }
]

/** The locales whose content is complete enough to expose in the UI. */
export function readyLocales (): LocaleMeta[] {
  return LOCALES.filter((l) => l.ready)
}

/** Prefixes a root-relative path with a locale (the default locale stays at the root). */
export function localizedPath (path: string, locale: Locale): string {
  if (locale === DEFAULT_LOCALE) return path
  return `/${locale}${path}`.replace(/\/+$/, '') || `/${locale}`
}

/** Splits a path into its locale (if any) and the locale-free remainder. */
export function stripLocale (path: string): { locale: Locale, path: string } {
  const match = /^\/([a-z]{2})(\/.*|$)/.exec(path)
  const code = match?.[1] as Locale | undefined
  if (code !== undefined && LOCALES.some((l) => l.code === code) && code !== DEFAULT_LOCALE) {
    return { locale: code, path: match?.[2] === '' ? '/' : (match?.[2] ?? '/') }
  }
  return { locale: DEFAULT_LOCALE, path }
}
