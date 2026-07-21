import { AuthConfiguration } from '../app/configurations/AuthConfiguration'
import { authBlueprint } from '@stone-js/auth'
import { IBlueprint } from '@stone-js/core'

vi.mock(import('@stone-js/core'), async (importOriginal) => ({ ...(await importOriginal()), Configuration: vi.fn(() => vi.fn()) }))
vi.mock(import('@stone-js/env'), async (importOriginal) => ({ ...(await importOriginal()), getString: vi.fn(() => 'test-secret') }))

describe('AuthConfiguration', () => {
  it('merges the auth blueprint and configures the signing strategy', () => {
    const set = vi.fn(function (this: unknown) { return blueprint })
    const blueprint = { set } as unknown as IBlueprint

    new AuthConfiguration().configure(blueprint)

    expect(set).toHaveBeenNthCalledWith(1, authBlueprint)
    expect(set).toHaveBeenCalledWith('stone.auth.secret', 'test-secret')
    expect(set).toHaveBeenCalledWith('stone.auth.issuer', 'stone-blog-starter')
    expect(set).toHaveBeenCalledWith('stone.auth.ttl', '1h')
  })
})
