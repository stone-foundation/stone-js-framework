import {
  SignJWT,
  decodeJwt,
  jwtVerify,
  importSPKI,
  importPKCS8,
  createRemoteJWKSet
} from 'jose'
import { AuthConfigError, AuthenticationError } from './errors/AuthErrors'
import { AuthOptions, IAuthenticator, JwtClaims, SignOptions, VerifyOptions } from './declarations'

/** A key usable by jose for verification: a symmetric secret, an imported key, or a JWKS resolver. */
type VerificationKey = Uint8Array | Awaited<ReturnType<typeof importSPKI>> | ReturnType<typeof createRemoteJWKSet>

/**
 * The authentication service.
 *
 * Stateless and edge-native: it wraps [jose](https://github.com/panva/jose) to sign and verify
 * JWTs on Node, the browser, Deno, Bun and the edge — no session store. It supports a shared
 * secret (HMAC), an asymmetric key pair (RS/ES/PS), and remote JWKS verification for tokens
 * issued by an external identity provider (OAuth/OIDC), plus issuer/audience/scope checks.
 */
export class Authenticator implements IAuthenticator {
  private remoteJwks?: ReturnType<typeof createRemoteJWKSet>

  /**
   * @param options - Authentication options.
   * @returns A new Authenticator.
   */
  static create (options: AuthOptions): Authenticator {
    return new this(options)
  }

  /**
   * @param options - Authentication options.
   */
  constructor (private readonly options: AuthOptions) {}

  /**
   * Sign a token from claims.
   *
   * @param claims - The claims to embed.
   * @param options - Per-call signing overrides.
   * @returns The signed compact JWT.
   */
  async sign (claims: JwtClaims, options: SignOptions = {}): Promise<string> {
    const alg = options.algorithm ?? this.options.algorithm ?? 'HS256'
    const issuer = options.issuer ?? this.options.issuer
    const audience = options.audience ?? this.options.audience
    const expiresIn = options.expiresIn ?? this.options.expiresIn ?? '1h'

    let jwt = new SignJWT(claims).setProtectedHeader({ alg }).setIssuedAt().setExpirationTime(expiresIn)

    if (options.subject !== undefined) { jwt = jwt.setSubject(options.subject) }
    if (issuer !== undefined) { jwt = jwt.setIssuer(issuer) }
    if (audience !== undefined) { jwt = jwt.setAudience(audience) }

    return await jwt.sign(await this.getSigningKey(alg))
  }

  /**
   * Verify a token and return its claims.
   *
   * @param token - The compact JWT.
   * @param options - Per-call verification overrides.
   * @returns The verified claims.
   * @throws {AuthenticationError} When the token is missing, invalid or expired.
   */
  async verify<T extends JwtClaims = JwtClaims> (token: string, options: VerifyOptions = {}): Promise<T> {
    if (token.length === 0) {
      throw new AuthenticationError('A token is required.')
    }

    // Resolve the key outside the try so a misconfiguration surfaces as an AuthConfigError,
    // never masked as an "invalid token".
    const key = await this.getVerificationKey()

    try {
      const verifyOptions = {
        issuer: options.issuer ?? this.options.issuer,
        audience: options.audience ?? this.options.audience,
        algorithms: options.algorithms ?? this.options.algorithms,
        clockTolerance: options.clockTolerance ?? this.options.clockTolerance
      }

      // Branch so TypeScript picks the right `jwtVerify` overload: a JWKS resolver (function) vs a
      // symmetric/asymmetric key.
      const { payload } = typeof key === 'function'
        ? await jwtVerify(token, key, verifyOptions)
        : await jwtVerify(token, key, verifyOptions)

      return payload as T
    } catch (error: any) {
      throw new AuthenticationError('Invalid or expired token.', { cause: error })
    }
  }

  /**
   * Decode a token without verifying it. Never trust the result for authorization decisions.
   *
   * @param token - The compact JWT.
   * @returns The decoded claims.
   */
  decode<T extends JwtClaims = JwtClaims> (token: string): T {
    return decodeJwt(token) as T
  }

  /**
   * Resolve the signing key from configuration.
   *
   * @param alg - The signing algorithm.
   * @returns The key.
   * @throws {AuthConfigError} When no signing key is configured.
   */
  private async getSigningKey (alg: string): Promise<Uint8Array | Awaited<ReturnType<typeof importPKCS8>>> {
    if (this.options.secret !== undefined) {
      return new TextEncoder().encode(this.options.secret)
    }
    if (this.options.privateKey !== undefined) {
      return await importPKCS8(this.options.privateKey, alg)
    }
    throw new AuthConfigError('No signing key configured. Set `stone.auth.secret` or `stone.auth.privateKey`.')
  }

  /**
   * Resolve the verification key from configuration (remote JWKS wins, then secret, then key).
   *
   * @returns The verification key.
   * @throws {AuthConfigError} When no verification strategy is configured.
   */
  private async getVerificationKey (): Promise<VerificationKey> {
    if (this.options.jwksUri !== undefined) {
      this.remoteJwks ??= createRemoteJWKSet(new URL(this.options.jwksUri))
      return this.remoteJwks
    }
    if (this.options.secret !== undefined) {
      return new TextEncoder().encode(this.options.secret)
    }
    if (this.options.publicKey !== undefined) {
      return await importSPKI(this.options.publicKey, this.options.algorithm ?? 'RS256')
    }
    throw new AuthConfigError('No verification key configured. Set `stone.auth.secret`, `stone.auth.publicKey` or `stone.auth.jwksUri`.')
  }
}
