import { getBlueprint, hasBlueprint } from '@stone-js/core'
import { I18n } from '../../src/decorators/I18n'
import { I18nServiceProvider } from '../../src/I18nServiceProvider'
import { SetLocaleMiddleware } from '../../src/middleware/SetLocaleMiddleware'

describe('@I18n', () => {
  it('is the single line a consumer writes: provider + locale middleware, zero options', () => {
    @I18n()
    class Application {}

    expect(hasBlueprint(Application)).toBe(true)
    const blueprint: any = getBlueprint(Application, { stone: {} })

    expect(blueprint.stone.providers).toContain(I18nServiceProvider)
    // The blueprint is deep-cloned, so the meta entry is a copy; what must survive is the class it
    // points at, which is what the kernel resolves.
    expect(blueprint.stone.kernel.middleware).toEqual([
      expect.objectContaining({ module: SetLocaleMiddleware, isClass: true })
    ])
    expect(blueprint.stone.i18n).toEqual({})
  })

  it('narrows the defaults with the options it is given', () => {
    @I18n({ locales: ['en', 'fr'], fallbackLocale: 'en', param: 'lang', timeZone: 'America/Port-au-Prince' })
    class Application {}

    const blueprint: any = getBlueprint(Application, { stone: {} })

    expect(blueprint.stone.i18n).toEqual({
      locales: ['en', 'fr'],
      fallbackLocale: 'en',
      param: 'lang',
      timeZone: 'America/Port-au-Prince'
    })
  })

  it('does not leak options between two decorated applications', () => {
    // The blueprint is cloned per application: a shared reference would let one app's locales bleed
    // into another's, which only shows up in a monorepo with several apps.
    @I18n({ locales: ['en'] })
    class First {}

    @I18n({ locales: ['ht', 'fr'] })
    class Second {}

    expect((getBlueprint(First, { stone: {} }) as any).stone.i18n.locales).toEqual(['en'])
    expect((getBlueprint(Second, { stone: {} }) as any).stone.i18n.locales).toEqual(['ht', 'fr'])
  })
})
