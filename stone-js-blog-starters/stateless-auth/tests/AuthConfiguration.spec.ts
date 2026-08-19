import { AuthConfiguration } from '../app/configurations/AuthConfiguration'
import { IBlueprint } from '@stone-js/core'

vi.mock(import('@stone-js/core'), async (importOriginal) => ({ ...(await importOriginal()), Configuration: vi.fn(() => vi.fn()) }))
vi.mock(import('@stone-js/env'), async (importOriginal) => ({ ...(await importOriginal()), getString: vi.fn(() => 'test-secret') }))

describe('AuthConfiguration', () => {
  it('configures the signing strategy, and does not try to enable the module', () => {
    const set = vi.fn(function (this: unknown) { return blueprint })
    const blueprint = { set } as unknown as IBlueprint

    new AuthConfiguration().configure(blueprint)

    // A configuration configures. The module is enabled on the application, with `@Auth()` or with
    // `authBlueprint` on the manifest; setting a blueprint here only merged a fragment into the store.
    expect(set).toHaveBeenNthCalledWith(1, 'stone.auth.secret', 'test-secret')
    expect(set).toHaveBeenCalledWith('stone.auth.issuer', 'stone-blog-starter')
    expect(set).toHaveBeenCalledWith('stone.auth.ttl', '1h')
  })
})
