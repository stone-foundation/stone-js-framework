import { SignJWT, exportPKCS8, exportSPKI, generateKeyPair } from 'jose'
import { Authenticator } from '../src/Authenticator'
import { AuthConfigError, AuthenticationError } from '../src/errors/AuthErrors'

const secret = 'a-very-long-test-secret-value-0123456789'

describe('Authenticator (symmetric HS256)', () => {
  const auth = Authenticator.create({ secret, issuer: 'stone', audience: 'app', expiresIn: '1h' })

  it('signs and verifies a token round-trip with claims', async () => {
    const token = await auth.sign({ scope: 'read write' }, { subject: 'user-1' })
    const claims = await auth.verify(token)
    expect(claims.sub).toBe('user-1')
    expect(claims.iss).toBe('stone')
    expect(claims.aud).toBe('app')
    expect(claims.scope).toBe('read write')
    expect(typeof claims.exp).toBe('number')
  })

  it('decodes without verifying', async () => {
    const token = await auth.sign({ role: 'admin' })
    expect(auth.decode(token).role).toBe('admin')
  })

  it('rejects an empty token', async () => {
    await expect(auth.verify('')).rejects.toThrow(AuthenticationError)
  })

  it('rejects a tampered token', async () => {
    const token = await auth.sign({ a: 1 })
    await expect(auth.verify(token + 'x')).rejects.toThrow(AuthenticationError)
  })

  it('rejects a token signed with a different secret', async () => {
    const other = Authenticator.create({ secret: 'another-very-long-secret-value-987654321' })
    const token = await other.sign({ a: 1 })
    await expect(auth.verify(token)).rejects.toThrow(AuthenticationError)
  })

  it('rejects an expired token', async () => {
    const past = Math.floor(Date.now() / 1000) - 3600
    const token = await new SignJWT({}).setProtectedHeader({ alg: 'HS256' }).setExpirationTime(past).sign(new TextEncoder().encode(secret))
    await expect(auth.verify(token)).rejects.toThrow(AuthenticationError)
  })

  it('honours per-call issuer/audience/expiry overrides', async () => {
    const token = await auth.sign({}, { issuer: 'other', audience: 'svc', expiresIn: '5m' })
    const claims = await auth.verify(token, { issuer: 'other', audience: 'svc' })
    expect(claims.iss).toBe('other')
  })
})

describe('Authenticator (asymmetric RS256)', () => {
  it('signs with a private key and verifies with the public key', async () => {
    const { privateKey, publicKey } = await generateKeyPair('RS256')
    const pkcs8 = await exportPKCS8(privateKey)
    const spki = await exportSPKI(publicKey)

    const signer = Authenticator.create({ privateKey: pkcs8, algorithm: 'RS256', expiresIn: '1h' })
    // Omit `algorithm` on the verifier so the RS256 default path is exercised.
    const verifier = Authenticator.create({ publicKey: spki })

    const token = await signer.sign({ sub: 'svc-1' })
    const claims = await verifier.verify(token)
    expect(claims.sub).toBe('svc-1')
  })
})

describe('Authenticator (misconfiguration)', () => {
  it('throws when no signing key is configured', async () => {
    await expect(Authenticator.create({}).sign({ a: 1 })).rejects.toThrow(AuthConfigError)
  })

  it('throws a config error when no verification key is configured', async () => {
    const token = await Authenticator.create({ secret }).sign({ a: 1 })
    await expect(Authenticator.create({}).verify(token)).rejects.toThrow(AuthConfigError)
  })
})
