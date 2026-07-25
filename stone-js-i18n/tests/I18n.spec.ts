import { I18n, collectNamespaces } from '../src/I18n'
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

const create = (overrides = {}): I18n =>
  I18n.create({ locale: 'en', fallbackLocale: 'en', locales: ['en', 'fr'], resources: structuredClone(resources), ...overrides })

describe('I18n', () => {
  it('translates with interpolation', () => {
    expect(create().t('hello', { name: 'Ada' })).toBe('Hello Ada!')
  })

  it('creates with all defaults (no options)', () => {
    const i18n = I18n.create()
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
    const i18n = I18n.create({ resources: { en: { translation: { hi: 'Hi <name>' } } }, interpolation: { prefix: '<', suffix: '>' } })
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
  })

  describe('process-wide instance', () => {
    it('publishes and retrieves the instance', () => {
      const i18n = create()
      I18n.setInstance(i18n)
      expect(I18n.getInstance()).toBe(i18n)
    })

    it('throws when no instance is published', () => {
      // @ts-expect-error reset private static for the test
      I18n.instance = undefined
      expect(() => I18n.getInstance()).toThrow(I18nError)
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
