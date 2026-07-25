import { LocaleAwareEvent, LocaleResolutionOptions, Locale } from './declarations'

/** Custom request headers checked first, in order. Explicit, forward-looking, framework-neutral. */
export const DEFAULT_LOCALE_HEADERS: string[] = ['x-locale', 'x-lang', 'x-language']

/**
 * Resolve the locale for a request, platform-agnostically.
 *
 * Order (first match wins): a custom `resolver` → custom headers (`x-locale`/`x-lang`/`x-language`)
 * → query string → cookie → the standard `Accept-Language` negotiation → the event's own locale →
 * `fallbackLocale`. Every candidate is negotiated against the supported `locales` (exact tag, then
 * base language, e.g. `fr-CA` → `fr`), so an unsupported locale never leaks through.
 *
 * @param event - The (duck-typed) incoming event.
 * @param options - The resolution options.
 * @returns The resolved locale, or `undefined` when nothing matches and no fallback is set.
 */
export function resolveLocale (event: LocaleAwareEvent, options: LocaleResolutionOptions = {}): Locale | undefined {
  const locales = options.locales

  const fromResolver = options.resolver !== undefined ? negotiate(options.resolver(event, options), locales) : undefined
  if (fromResolver !== undefined) { return fromResolver }

  for (const candidate of collectCandidates(event, options)) {
    const resolved = negotiate(candidate, locales)
    if (resolved !== undefined) { return resolved }
  }

  return fromAcceptLanguage(event, options) ?? negotiate(event.locale, locales) ?? options.fallbackLocale
}

/**
 * Gather the ordered explicit candidates: route param → custom headers → query → cookie.
 *
 * @param event - The incoming event.
 * @param options - The resolution options.
 * @returns The raw candidates, in priority order.
 */
function collectCandidates (event: LocaleAwareEvent, options: LocaleResolutionOptions): Array<string | undefined> {
  const candidates: Array<string | undefined> = []

  if (options.param !== undefined) {
    candidates.push(event.getParam?.<string>(options.param))
  }
  for (const header of options.headers ?? DEFAULT_LOCALE_HEADERS) {
    candidates.push(event.getHeader?.<string>(header))
  }
  if (options.query !== false) {
    candidates.push(event.get?.<string | undefined>(options.query ?? 'lang', undefined))
  }
  if (options.cookie !== false) {
    candidates.push(event.getCookie?.<string>(options.cookie ?? 'locale'))
  }

  return candidates
}

/**
 * Negotiate the standard `Accept-Language` header against the supported locales.
 *
 * @param event - The incoming event.
 * @param options - The resolution options.
 * @returns The negotiated locale, or `undefined`.
 */
function fromAcceptLanguage (event: LocaleAwareEvent, options: LocaleResolutionOptions): Locale | undefined {
  const locales = options.locales
  if (options.acceptLanguage === false || event.acceptsLanguages === undefined || locales === undefined || locales.length === 0) {
    return undefined
  }

  const negotiated = event.acceptsLanguages(...locales)
  const value = typeof negotiated === 'string' ? negotiated : negotiated?.value
  return value !== undefined && value !== '' ? value : undefined
}

/**
 * Validate/normalise a candidate against the supported locales (exact tag, then base language,
 * e.g. `fr-CA` → `fr`). Returns the raw candidate when no locales restrict it.
 *
 * @param candidate - The raw candidate.
 * @param locales - The supported locales (unrestricted when omitted/empty).
 * @returns The accepted locale, or `undefined`.
 */
export function negotiate (candidate: string | undefined, locales?: Locale[]): Locale | undefined {
  if (candidate === undefined || candidate.trim() === '') { return undefined }

  const normalized = candidate.trim()
  if (locales === undefined || locales.length === 0) { return normalized }
  if (locales.includes(normalized)) { return normalized }

  const base = normalized.split('-')[0].toLowerCase()
  return locales.find((locale) => locale.toLowerCase() === base || locale.toLowerCase().split('-')[0] === base)
}
