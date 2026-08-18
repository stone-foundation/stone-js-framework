import { I18nManager, collectNamespaces } from '../src/I18nManager'
import { I18nError } from '../src/errors/I18nError'

const resources = {
  en: {
    translation: { hello: 'Hello {{name}}!', bye: 'Bye' },
    cart: { items_one: '{{count}} item', items_other: '{{count}} items' }
  },
  fr: {
    translation: { hello: 'Bonjour {{name}} !', bye: 'Au revoir' },
    cart: { items_one: '{{count}} article', items_other: '{{count}} articles' }
  }
}

const create = (overrides = {}): I18nManager =>
  I18nManager.create({ locale: 'en', fallbackLocale: 'en', locales: ['en', 'fr'], resources: structuredClone(resources), ...overrides })

describe('I18nManager', () => {
  it('translates with interpolation', () => {
    expect(create().t('hello', { name: 'Ada' })).toBe('Hello Ada!')
  })

  it('creates with all defaults (no options)', () => {
    const i18n = I18nManager.create()
    expect(i18n.getLocale()).toBe('en')
    expect(i18n.t('any.key')).toBe('any.key')
  })

  it('pluralizes with count via Intl.PluralRules', () => {
    const i18n = create()
    expect(i18n.t('items', { ns: 'cart', count: 1 })).toBe('1 item')
    expect(i18n.t('items', { ns: 'cart', count: 5 })).toBe('5 items')
  })

  it('supports a one-off locale override', () => {
    expect(create().t('bye', { locale: 'fr' })).toBe('Au revoir')
  })

  it('exposes the current locale via getter and getLocale()', () => {
    const i18n = create()
    expect(i18n.locale).toBe('en')
    expect(i18n.getLocale()).toBe('en')
  })

  it('reports key existence with has()', () => {
    const i18n = create()
    expect(i18n.has('hello')).toBe(true)
    expect(i18n.has('bye', { locale: 'fr' })).toBe(true)
    expect(i18n.has('nope')).toBe(false)
    expect(i18n.has('hello', { ns: 'cart' })).toBe(false)
  })

  it('changes the active locale with setLocale()', async () => {
    const i18n = create()
    await i18n.setLocale('fr')
    expect(i18n.getLocale()).toBe('fr')
    expect(i18n.t('bye')).toBe('Au revoir')
  })

  it('forLocale() binds a translator without mutating the shared instance', () => {
    const i18n = create()
    const fr = i18n.forLocale('fr')
    expect(fr.getLocale()).toBe('fr')
    expect(fr.locale).toBe('fr')
    expect(fr.t('hello', { name: 'Ada' })).toBe('Bonjour Ada !')
    expect(fr.t('items', { ns: 'cart', count: 2 })).toBe('2 articles')
    // shared instance untouched (concurrency-safe)
    expect(i18n.getLocale()).toBe('en')
    expect(i18n.t('bye')).toBe('Bye')
  })

  it('adds resource bundles at runtime', () => {
    const i18n = create()
    i18n.addResources('en', 'extra', { welcome: 'Welcome' })
    expect(i18n.t('welcome', { ns: 'extra' })).toBe('Welcome')
  })

  it('returns the key for a missing translation by default', () => {
    expect(create().t('missing.key')).toBe('missing.key')
  })

  it('returns an empty string for a missing key when missing="empty"', () => {
    expect(create({ missing: 'empty' }).t('missing.key')).toBe('')
  })

  it('renders a missing key with a custom function', () => {
    const i18n = create({ missing: (key: string, locale: string, ns: string) => `[${locale}:${ns}:${key}]` })
    expect(i18n.t('missing.key')).toBe('[en:translation:missing.key]')
  })

  it('honours custom interpolation delimiters', () => {
    const i18n = I18nManager.create({ resources: { en: { translation: { hi: 'Hi <name>' } } }, interpolation: { prefix: '<', suffix: '>' } })
    expect(i18n.t('hi', { name: 'Zoe' })).toBe('Hi Zoe')
  })

  describe('Intl formatters', () => {
    it('formats numbers, dates, relative time and lists for the active locale', () => {
      const fr = create().forLocale('fr')
      expect(fr.number(1234.5)).toBe('1 234,5')
      expect(fr.date('2026-07-24', { dateStyle: 'medium' })).toContain('2026')
      expect(fr.relativeTime(-3, 'day')).toBe('il y a 3 jours')
      expect(fr.list(['a', 'b', 'c'])).toBe('a, b et c')
    })

    it('formats dates in a configured time zone (and per-call override)', () => {
      const instant = '2026-01-15T00:00:00Z' // midnight UTC
      const nyc = create({ timeZone: 'America/New_York' }) // UTC-5 in January
      const tokyo = create({ timeZone: 'Asia/Tokyo' }) // UTC+9
      expect(nyc.date(instant, { day: 'numeric' })).toBe('14') // still the 14th in New York
      expect(tokyo.date(instant, { day: 'numeric' })).toBe('15') // already the 15th in Tokyo
      expect(nyc.date(instant, { day: 'numeric', timeZone: 'Asia/Tokyo' })).toBe('15') // per-call wins
      expect(nyc.forLocale('fr').date(instant, { day: 'numeric' })).toBe('14') // propagates to forLocale
    })
  })

  it('exposes the raw i18next instance (shared across bound translators)', () => {
    const i18n = create()
    expect(typeof i18n.raw.t).toBe('function')
    expect(i18n.forLocale('fr').raw).toBe(i18n.raw)
  })

  describe('everyday utilities', () => {
    it('formats compact, currency and percent (locale-aware)', () => {
      const en = create()
      expect(en.compact(1000)).toBe('1K')
      expect(en.compact(1_500_000, { maximumFractionDigits: 1 })).toBe('1.5M')
      expect(en.currency(19.9, 'EUR')).toContain('€')
      expect(en.percent(0.25)).toBe('25%')
      const fr = en.forLocale('fr')
      expect(fr.compact(1_000_000)).toContain('M')
      expect(fr.percent(0.25)).toContain('25')
    })

    it('reports the writing direction for <html dir>', () => {
      const i18n = create()
      expect(i18n.dir()).toBe('ltr')
      expect(i18n.dir('ar')).toBe('rtl')
      expect(i18n.dir('he-IL')).toBe('rtl')
      expect(i18n.forLocale('fr').dir()).toBe('ltr')
    })

    it('notifies onMissingKey for untranslated keys (dev aid)', () => {
      const missing: string[] = []
      const i18n = I18nManager.create({ locale: 'en', resources: structuredClone(resources), onMissingKey: (key, locale, ns) => missing.push(`${ns}:${locale}:${key}`) })
      i18n.t('nope.here')
      expect(missing).toContain('translation:en:nope.here')
    })
  })

  describe('process-wide instance', () => {
    it('publishes and retrieves the instance', () => {
      const i18n = create()
      I18nManager.setInstance(i18n)
      expect(I18nManager.getInstance()).toBe(i18n)
    })

    it('throws when no instance is published', () => {
      // @ts-expect-error reset private static for the test
      I18nManager.instance = undefined
      expect(() => I18nManager.getInstance()).toThrow(I18nError)
    })
  })

  describe('lazy loadLocale', () => {
    const makeLoaders = (calls: Record<string, number>): Record<string, () => Promise<unknown>> => ({
      '/app/i18n/en/translation.json': async () => { calls.en = (calls.en ?? 0) + 1; return { default: { hi: 'Hi' } } },
      '/app/i18n/fr/translation.json': async () => { calls.fr = (calls.fr ?? 0) + 1; return { hi: 'Salut' } } // no default export
    })

    it('loads the active locale and the fallback on demand, then translates both', async () => {
      const i18n = I18nManager.create({ locale: 'fr', fallbackLocale: 'en', loaders: makeLoaders({}) })
      await i18n.loadLocale('fr')
      expect(i18n.t('hi', { locale: 'fr' })).toBe('Salut')
      expect(i18n.t('hi', { locale: 'en' })).toBe('Hi') // fallback catalog loaded alongside
    })

    it('is idempotent and shares the loaded set across forLocale clones', async () => {
      const calls: Record<string, number> = {}
      const i18n = I18nManager.create({ locale: 'en', fallbackLocale: 'en', loaders: makeLoaders(calls) })
      await i18n.loadLocale('fr')
      await i18n.forLocale('fr').loadLocale('fr') // clone shares `loaded` → no reimport
      expect(calls.fr).toBe(1)
    })

    it('does not load the fallback twice when it is the active locale', async () => {
      const calls: Record<string, number> = {}
      const i18n = I18nManager.create({ locale: 'en', fallbackLocale: 'en', loaders: makeLoaders(calls) })
      await i18n.loadLocale('en')
      expect(calls.en).toBe(1)
    })

    it('uses the first entry of an array fallbackLocale', async () => {
      const i18n = I18nManager.create({ locale: 'fr', fallbackLocale: ['en', 'de'], loaders: makeLoaders({}) })
      await i18n.loadLocale('fr')
      expect(i18n.t('hi', { locale: 'en' })).toBe('Hi') // 'en' (first of the array) loaded as fallback
    })

    it('is a no-op when no loaders are configured', async () => {
      await expect(create().loadLocale('fr')).resolves.toBeUndefined()
    })

    it('merges every catalogue of a locale that shares a namespace', async () => {
      // Deep discovery finds a catalogue per module, so several of them carry the same namespace for
      // one locale. All of them must land, and a slow import must not lose to a fast one.
      const i18n = I18nManager.create({
        locale: 'fr',
        loaders: {
          '/app/i18n/fr/translation.json': async () => ({ default: { hi: 'Salut', bye: 'Ciao' } }),
          '/app/modules/billing/i18n/fr/translation.json': async () => {
            await new Promise((resolve) => setTimeout(resolve, 5)) // settles last
            return { default: { hi: 'Bonjour', invoice: 'Facture' } }
          }
        }
      })

      await i18n.loadLocale('fr')

      expect(i18n.t('invoice')).toBe('Facture') // the module catalogue landed
      expect(i18n.t('bye')).toBe('Ciao') // the shared one was not replaced
      expect(i18n.t('hi')).toBe('Bonjour') // the deeper path wins the conflict, whatever the timing
    })
  })

  describe('collectNamespaces', () => {
    it('collects every namespace across locales, including the default', () => {
      expect(collectNamespaces(resources, 'translation').sort()).toEqual(['cart', 'translation'])
    })

    it('always includes the default namespace even with no resources', () => {
      expect(collectNamespaces({}, 'translation')).toEqual(['translation'])
    })
  })
})
