import { Authenticator } from '../src/Authenticator'

// Isolate this file with a fully mocked `jose` so the remote-JWKS path is exercised without a
// network call. (The other suites use the real `jose`.)
const createRemoteJWKSet = vi.fn(() => vi.fn())
const jwtVerify = vi.fn(async () => ({ payload: { sub: 'remote-user', scope: 'read' } }))

vi.mock('jose', () => ({
  createRemoteJWKSet: (...args: unknown[]) => createRemoteJWKSet(...args),
  jwtVerify: (...args: unknown[]) => jwtVerify(...args),
  SignJWT: class {},
  decodeJwt: vi.fn(),
  importPKCS8: vi.fn(),
  importSPKI: vi.fn()
}))

describe('Authenticator (remote JWKS)', () => {
  beforeEach(() => {
    createRemoteJWKSet.mockClear()
    jwtVerify.mockClear()
  })

  it('verifies against a remote JWKS and caches the key set', async () => {
    const auth = Authenticator.create({ jwksUri: 'https://idp.test/.well-known/jwks.json' })

    const first = await auth.verify('a.b.c')
    const second = await auth.verify('d.e.f')

    expect(first.sub).toBe('remote-user')
    expect(second.sub).toBe('remote-user')
    // The JWKS resolver is created once and reused.
    expect(createRemoteJWKSet).toHaveBeenCalledTimes(1)
    expect(jwtVerify).toHaveBeenCalledTimes(2)
  })
})
