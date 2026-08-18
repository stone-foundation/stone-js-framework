import { deepMerge, loadTranslations } from '../src/loadTranslations'

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

  it('merges catalogues that share a locale and a namespace', () => {
    // The layout deep discovery enables: one shared catalogue plus one per module, several of them
    // carrying the same `common` namespace. Assigning instead of merging used to drop all but the last.
    const glob = {
      '/app/i18n/fr/common.json': { default: { hello: 'Bonjour', bye: 'Au revoir' } },
      '/app/modules/billing/i18n/fr/common.json': { default: { invoice: 'Facture' } },
      '/app/modules/crm/i18n/fr/common.json': { default: { contact: 'Contact' } }
    }
    expect(loadTranslations(glob)).toEqual({
      fr: { common: { hello: 'Bonjour', bye: 'Au revoir', invoice: 'Facture', contact: 'Contact' } }
    })
  })

  it('recurses into nested key groups when merging', () => {
    const glob = {
      '/app/i18n/en/common.json': { default: { form: { submit: 'Submit', cancel: 'Cancel' } } },
      '/app/modules/billing/i18n/en/common.json': { default: { form: { submit: 'Pay' } } }
    }
    // The deeper catalogue refines one leaf and leaves its siblings alone.
    expect(loadTranslations(glob)).toEqual({
      en: { common: { form: { submit: 'Pay', cancel: 'Cancel' } } }
    })
  })

  it('resolves a conflicting key by path order, not by object order', () => {
    const shared = { '/app/i18n/fr/common.json': { default: { hello: 'A' } } }
    const module = { '/app/modules/billing/i18n/fr/common.json': { default: { hello: 'B' } } }
    // Whichever order the bundler hands them over, the deeper path wins, so builds are reproducible.
    expect(loadTranslations({ ...shared, ...module })).toEqual({ fr: { common: { hello: 'B' } } })
    expect(loadTranslations({ ...module, ...shared })).toEqual({ fr: { common: { hello: 'B' } } })
  })
})

describe('deepMerge', () => {
  it('returns the source when there is nothing to merge into', () => {
    expect(deepMerge(undefined, { a: 1 })).toEqual({ a: 1 })
  })

  it('treats arrays and nulls as leaves, not as key groups', () => {
    expect(deepMerge({ a: [1, 2] }, { a: [3] })).toEqual({ a: [3] })
    expect(deepMerge({ a: { b: 1 } }, { a: null })).toEqual({ a: null })
    expect(deepMerge({ a: null }, { a: { b: 1 } })).toEqual({ a: { b: 1 } })
  })

  it('does not mutate its inputs', () => {
    const target = { a: { b: 1 } }
    deepMerge(target, { a: { c: 2 } })
    expect(target).toEqual({ a: { b: 1 } })
  })
})
