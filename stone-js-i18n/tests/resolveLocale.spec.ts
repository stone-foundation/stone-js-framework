import { resolveLocale, DEFAULT_LOCALE_HEADERS } from '../src/resolveLocale'
import { LocaleAwareEvent } from '../src/declarations'

/** Build a duck-typed event from raw sources. */
function makeEvent (sources: {
  headers?: Record<string, string>
  query?: Record<string, string>
  cookies?: Record<string, string>
  accepts?: string
  locale?: string
} = {}): LocaleAwareEvent {
  return {
    locale: sources.locale,
    getHeader: (name: string) => sources.headers?.[name.toLowerCase()],
    get: (key: string, fallback?: unknown) => sources.query?.[key] ?? fallback,
    getCookie: (name: string) => sources.cookies?.[name],
    acceptsLanguages: () => sources.accepts
  }
}

const locales = ['en', 'fr', 'pt-BR']

describe('resolveLocale', () => {
  it('exposes the default custom headers', () => {
    expect(DEFAULT_LOCALE_HEADERS).toEqual(['x-locale', 'x-lang', 'x-language'])
  })

  it('prefers a custom resolver when it returns a value', () => {
    const event = makeEvent({ headers: { 'x-locale': 'fr' } })
    expect(resolveLocale(event, { locales, resolver: () => 'en' })).toBe('en')
  })

  it('falls through when the custom resolver returns undefined', () => {
    const event = makeEvent({ headers: { 'x-locale': 'fr' } })
    expect(resolveLocale(event, { locales, resolver: () => undefined })).toBe('fr')
  })

  it('reads the custom headers in order (x-locale, then x-lang, then x-language)', () => {
    expect(resolveLocale(makeEvent({ headers: { 'x-locale': 'fr' } }), { locales })).toBe('fr')
    expect(resolveLocale(makeEvent({ headers: { 'x-lang': 'fr' } }), { locales })).toBe('fr')
    expect(resolveLocale(makeEvent({ headers: { 'x-language': 'fr' } }), { locales })).toBe('fr')
  })

  it('honours a custom header list', () => {
    const event = makeEvent({ headers: { 'accept-language-override': 'fr' } })
    expect(resolveLocale(event, { locales, headers: ['accept-language-override'] })).toBe('fr')
  })

  it('reads the query parameter (default and custom, or disabled)', () => {
    expect(resolveLocale(makeEvent({ query: { lang: 'fr' } }), { locales })).toBe('fr')
    expect(resolveLocale(makeEvent({ query: { locale: 'fr' } }), { locales, query: 'locale' })).toBe('fr')
    expect(resolveLocale(makeEvent({ query: { lang: 'fr' } }), { locales, query: false, fallbackLocale: 'en' })).toBe('en')
  })

  it('reads the cookie (default and custom, or disabled)', () => {
    expect(resolveLocale(makeEvent({ cookies: { locale: 'fr' } }), { locales })).toBe('fr')
    expect(resolveLocale(makeEvent({ cookies: { lang: 'fr' } }), { locales, cookie: 'lang' })).toBe('fr')
    expect(resolveLocale(makeEvent({ cookies: { locale: 'fr' } }), { locales, cookie: false, fallbackLocale: 'en' })).toBe('en')
  })

  it('negotiates the standard Accept-Language header', () => {
    expect(resolveLocale(makeEvent({ accepts: 'fr' }), { locales })).toBe('fr')
  })

  it('accepts an object result from acceptsLanguages', () => {
    const event: LocaleAwareEvent = { acceptsLanguages: () => ({ value: 'fr' }) }
    expect(resolveLocale(event, { locales })).toBe('fr')
  })

  it('skips Accept-Language when disabled', () => {
    expect(resolveLocale(makeEvent({ accepts: 'fr' }), { locales, acceptLanguage: false, fallbackLocale: 'en' })).toBe('en')
  })

  it('skips Accept-Language when no supported locales are configured', () => {
    expect(resolveLocale(makeEvent({ accepts: 'fr' }), { fallbackLocale: 'en' })).toBe('en')
  })

  it("falls back to the event's own locale", () => {
    expect(resolveLocale(makeEvent({ locale: 'fr' }), { locales })).toBe('fr')
  })

  it('falls back to fallbackLocale when nothing resolves', () => {
    expect(resolveLocale(makeEvent(), { locales, fallbackLocale: 'pt-BR' })).toBe('pt-BR')
  })

  it('returns undefined when nothing resolves and no fallback is set', () => {
    expect(resolveLocale(makeEvent(), { locales })).toBeUndefined()
  })

  describe('negotiation', () => {
    it('returns the raw candidate when no locales restrict it', () => {
      expect(resolveLocale(makeEvent({ headers: { 'x-locale': 'de' } }), {})).toBe('de')
    })

    it('matches on the base language (fr-CA -> fr)', () => {
      expect(resolveLocale(makeEvent({ headers: { 'x-locale': 'fr-CA' } }), { locales })).toBe('fr')
    })

    it('matches a region-specific supported locale by its base (pt -> pt-BR)', () => {
      expect(resolveLocale(makeEvent({ headers: { 'x-locale': 'pt' } }), { locales })).toBe('pt-BR')
    })

    it('drops an unsupported candidate and keeps resolving', () => {
      const event = makeEvent({ headers: { 'x-locale': 'de' }, cookies: { locale: 'fr' } })
      expect(resolveLocale(event, { locales })).toBe('fr')
    })

    it('ignores blank candidates', () => {
      expect(resolveLocale(makeEvent({ headers: { 'x-locale': '  ' }, locale: 'fr' }), { locales })).toBe('fr')
    })
  })
})
