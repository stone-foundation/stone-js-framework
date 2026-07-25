import { loadTranslations } from '../src/loadTranslations'

describe('loadTranslations', () => {
  it('normalises an eager glob into a locale/namespace resource map', () => {
    const glob = {
      '/app/i18n/en/common.json': { default: { hello: 'Hello' } },
      '/app/i18n/en/auth.json': { default: { login: 'Login' } },
      '/app/i18n/fr/common.json': { default: { hello: 'Bonjour' } }
    }
    expect(loadTranslations(glob)).toEqual({
      en: { common: { hello: 'Hello' }, auth: { login: 'Login' } },
      fr: { common: { hello: 'Bonjour' } }
    })
  })

  it('uses the module itself when there is no default export', () => {
    expect(loadTranslations({ '/app/i18n/en/common.ts': { hello: 'Hello' } }))
      .toEqual({ en: { common: { hello: 'Hello' } } })
  })

  it('tolerates a non-object module', () => {
    expect(loadTranslations({ '/app/i18n/en/common.json': null })).toEqual({ en: { common: null } })
  })

  it('strips any extension for the namespace', () => {
    expect(loadTranslations({ '/app/i18n/fr/deep.messages.json': { default: { a: 1 } } }))
      .toEqual({ fr: { 'deep.messages': { a: 1 } } })
  })

  it('ignores paths without a locale segment', () => {
    expect(loadTranslations({ 'common.json': { default: {} } })).toEqual({})
  })
})
