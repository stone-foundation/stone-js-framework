/**
 * Standard + custom JWT claims.
 */
export interface JwtClaims extends Record<string, unknown> {
  /** Subject (the principal the token is about). */
  sub?: string
  /** Issuer. */
  iss?: string
  /** Audience. */
  aud?: string | string[]
  /** Expiration time (seconds since epoch). */
  exp?: number
  /** Issued-at time (seconds since epoch). */
  iat?: number
  /** Space- or array-delimited OAuth scopes. */
  scope?: string | string[]
}

/**
 * Options for signing a token.
 */
export interface SignOptions {
  /** Subject (`sub`). */
  subject?: string
  /** Issuer (`iss`). Falls back to `stone.auth.issuer`. */
  issuer?: string
  /** Audience (`aud`). Falls back to `stone.auth.audience`. */
  audience?: string | string[]
  /** Lifetime, e.g. `'1h'`, `'15m'`, or seconds. Falls back to `stone.auth.expiresIn`. */
  expiresIn?: string | number
  /** Signing algorithm. Falls back to `stone.auth.algorithm` (default `HS256`). */
  algorithm?: string
}

/**
 * Options for verifying a token.
 */
export interface VerifyOptions {
  /** Expected issuer. */
  issuer?: string
  /** Expected audience. */
  audience?: string | string[]
  /** Accepted algorithms. */
  algorithms?: string[]
  /** Clock skew tolerance, e.g. `'5s'` or seconds. */
  clockTolerance?: string | number
}

/**
 * Authentication configuration (`stone.auth.*`).
 *
 * Provide exactly one signing/verification strategy: a shared `secret` (HMAC), an asymmetric
 * key pair (`privateKey`/`publicKey`, PEM), and/or a remote `jwksUri` (verify tokens from an
 * external identity provider). `secret` and asymmetric keys can be combined with `jwksUri`
 * (JWKS wins for verification).
 */
export interface AuthOptions {
  /** Shared secret for HMAC (HS256/384/512). */
  secret?: string
  /** PEM private key for asymmetric signing (RS/ES/PS). */
  privateKey?: string
  /** PEM public key for asymmetric verification. */
  publicKey?: string
  /** Remote JWKS endpoint for verification (OAuth/OIDC). */
  jwksUri?: string
  /** Default issuer stamped on and expected in tokens. */
  issuer?: string
  /** Default audience stamped on and expected in tokens. */
  audience?: string | string[]
  /** Default signing algorithm (default `HS256`). */
  algorithm?: string
  /** Accepted verification algorithms. */
  algorithms?: string[]
  /** Default token lifetime (default `'1h'`). */
  expiresIn?: string | number
  /** Clock skew tolerance for verification. */
  clockTolerance?: string | number
  /** Maps verified claims into the application principal attached to the event. */
  resolveUser?: (claims: JwtClaims) => unknown
}

/**
 * The authenticator service contract.
 */
export interface IAuthenticator {
  /** Sign a token from claims. */
  sign: (claims: JwtClaims, options?: SignOptions) => Promise<string>
  /** Verify a token and return its claims (throws on invalid/expired). */
  verify: <T extends JwtClaims = JwtClaims>(token: string, options?: VerifyOptions) => Promise<T>
  /** Decode a token without verifying it (never trust the result for authorization). */
  decode: <T extends JwtClaims = JwtClaims>(token: string) => T
}
