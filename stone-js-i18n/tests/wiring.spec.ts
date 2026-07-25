import { I18n } from '../src/I18n'
import { t, localeFromEvent, translatorFor } from '../src/helpers'
import { I18nError } from '../src/errors/I18nError'
import { IntegrationError } from '@stone-js/core'
import { I18nServiceProvider } from '../src/I18nServiceProvider'
import { SetLocaleMiddleware, MetaSetLocaleMiddleware } from '../src/middleware/SetLocaleMiddleware'
import { i18nBlueprint, defineI18n } from '../src/options/I18nBlueprint'

const resources = {
  en: { translation: { hello: 'Hello {{name}}!' } },
  fr: { translation: { hello: 'Bonjour {{name}} !' } }
}

/** A chainable, spy-able container. */
function makeContainer (config: object): { container: any, blueprint: any } {
  const blueprint = { get: vi.fn().mockReturnValue(config) }
  const container: any = {
    make: vi.fn().mockReturnValue(blueprint),
    instanceIf: vi.fn(() => container),
    alias: vi.fn(() => container)
  }
  return { container, blueprint }
}

describe('I18nServiceProvider', () => {
  it('builds the service from stone.i18n, publishes it and binds the aliases', () => {
    const { container, blueprint } = makeContainer({ locale: 'fr', locales: ['en', 'fr'], resources })
    new I18nServiceProvider(container).register()

    expect(blueprint.get).toHaveBeenCalledWith('stone.i18n', {})
    expect(container.instanceIf).toHaveBeenCalledWith(I18n, expect.any(I18n))
    expect(container.alias).toHaveBeenCalledWith(I18n, ['i18n', 'I18n'])
    expect(container.instanceIf).toHaveBeenCalledWith('i18next', expect.objectContaining({ t: expect.any(Function) }))
    expect(I18n.getInstance().getLocale()).toBe('fr')
  })
})

describe('helpers', () => {
  beforeEach(() => {
    I18n.setInstance(I18n.create({ locale: 'en', resources }))
  })

  it('t() translates through the process-wide instance', () => {
    expect(t('hello', { name: 'Ada' })).toBe('Hello Ada!')
  })

  it('localeFromEvent reads the request locale metadata', () => {
    const event = { getMetadataValue: vi.fn().mockReturnValue('fr') }
    expect(localeFromEvent(event)).toBe('fr')
  })

  it('localeFromEvent tolerates an event without metadata support', () => {
    expect(localeFromEvent({})).toBeUndefined()
  })

  it('translatorFor returns the request-bound translator when present', () => {
    const bound = I18n.getInstance().forLocale('fr')
    const event = { getMetadataValue: vi.fn().mockReturnValue(bound) }
    expect(translatorFor(event)).toBe(bound)
  })

  it('translatorFor falls back to the process-wide instance', () => {
    expect(translatorFor({ getMetadataValue: () => undefined })).toBe(I18n.getInstance())
    expect(translatorFor({})).toBe(I18n.getInstance())
  })
})

describe('SetLocaleMiddleware', () => {
  const i18n = I18n.create({ locale: 'en', locales: ['en', 'fr'], resources })

  const noRouter = { bound: () => false, make: () => undefined }

  function run (config: object, event: any, container: any = noRouter): { meta: Record<string, any>, result: Promise<unknown> } {
    const meta: Record<string, any> = {}
    event.setMetadataValue = (key: string, value: unknown) => { meta[key] = value }
    const middleware = new SetLocaleMiddleware({ i18n, blueprint: { get: () => config }, container } as any)
    const next = vi.fn().mockResolvedValue('RESPONSE')
    return { meta, result: middleware.handle(event, next as any) }
  }

  it('resolves the locale and stores it plus a bound translator on the event', async () => {
    const event: any = { getHeader: (n: string) => (n.toLowerCase() === 'x-locale' ? 'fr' : undefined), locale: 'en' }
    const { meta, result } = run({ locales: ['en', 'fr'], fallbackLocale: 'en' }, event)
    await expect(result).resolves.toBe('RESPONSE')
    expect(meta.locale).toBe('fr')
    expect(meta.i18n.getLocale()).toBe('fr')
    expect(meta.i18n.t('hello', { name: 'X' })).toBe('Bonjour X !')
  })

  it('falls back to the service locale when nothing resolves', async () => {
    const event: any = { getHeader: () => undefined, locale: undefined }
    const { meta, result } = run({ locales: ['en', 'fr'] }, event)
    await result
    expect(meta.locale).toBe('en')
  })

  it('normalises an array fallbackLocale and a missing one', async () => {
    const event: any = { getHeader: () => undefined }
    const a = run({ fallbackLocale: ['pt-BR', 'en'], locales: ['en', 'pt-BR'] }, event)
    await a.result
    expect(a.meta.locale).toBe('pt-BR')

    const event2: any = { getHeader: () => undefined }
    const b = run({ locale: 'fr' }, event2)
    await b.result
    expect(b.meta.locale).toBe('fr')
  })

  it('resolves a path-based locale via the router when a param is configured', async () => {
    const route = { bind: vi.fn().mockResolvedValue(undefined), getParam: () => 'fr' }
    const router = { findRoute: vi.fn().mockResolvedValue(route) }
    const container = { bound: (k: string) => k === 'router', make: () => router }
    const event: any = { getHeader: () => 'en' } // header says en, but the path wins
    const { meta, result } = run({ locales: ['en', 'fr'], param: 'lang' }, event, container)
    await result
    expect(meta.locale).toBe('fr')
    expect(route.bind).toHaveBeenCalledWith(event)
  })

  it('falls back to event sources when the router is not available', async () => {
    const event: any = { getHeader: (n: string) => (n.toLowerCase() === 'x-locale' ? 'fr' : undefined) }
    const { meta, result } = run({ locales: ['en', 'fr'], param: 'lang' }, event) // no router
    await result
    expect(meta.locale).toBe('fr')
  })

  it('is best-effort: a router error falls back to event sources', async () => {
    const container = { bound: () => true, make: () => ({ findRoute: vi.fn().mockRejectedValue(new Error('boom')) }) }
    const event: any = { getHeader: (n: string) => (n.toLowerCase() === 'x-locale' ? 'fr' : undefined) }
    const { meta, result } = run({ locales: ['en', 'fr'], param: 'lang' }, event, container)
    await result
    expect(meta.locale).toBe('fr')
  })

  it('falls back when the router finds no route', async () => {
    const container = { bound: () => true, make: () => ({ findRoute: vi.fn().mockResolvedValue(undefined) }) }
    const event: any = { getHeader: () => undefined, locale: 'en' }
    const { meta, result } = run({ locales: ['en', 'fr'], param: 'lang', fallbackLocale: 'en' }, event, container)
    await result
    expect(meta.locale).toBe('en')
  })

  it('is exported as a class meta middleware', () => {
    expect(MetaSetLocaleMiddleware).toEqual({ module: SetLocaleMiddleware, isClass: true })
  })
})

describe('i18nBlueprint', () => {
  it('contributes the provider and the kernel middleware, isomorphically (no filesystem)', () => {
    expect(i18nBlueprint.stone.providers).toContain(I18nServiceProvider)
    expect(i18nBlueprint.stone.kernel?.middleware).toContain(MetaSetLocaleMiddleware)
    expect(i18nBlueprint.stone.i18n).toEqual({})
    expect(i18nBlueprint.stone.blueprint).toBeUndefined()
  })

  it('defineI18n wraps a config fragment', () => {
    expect(defineI18n({ locale: 'fr', locales: ['en', 'fr'] })).toEqual({ i18n: { locale: 'fr', locales: ['en', 'fr'] } })
  })
})

describe('I18nError', () => {
  it('is an IntegrationError named I18nError', () => {
    const error = new I18nError('boom')
    expect(error).toBeInstanceOf(IntegrationError)
    expect(error.name).toBe('I18nError')
    expect(error.message).toBe('boom')
  })
})
