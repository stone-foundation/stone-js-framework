import { getString } from '@stone-js/env'
import { Configuration, IBlueprint, IConfiguration } from '@stone-js/core'

/**
 * AuthConfiguration
 *
 * Configures the signing strategy for @stone-js/auth. Here it is a shared HMAC secret; swap it for
 * `publicKey`/`jwksUri` to verify tokens from an external identity provider.
 *
 * The module itself is enabled on the application with `@Auth()` (see app/Application.ts), or with
 * `authBlueprint` on the manifest. A configuration configures; it does not enable.
 */
@Configuration()
export class AuthConfiguration implements IConfiguration {
  configure (blueprint: IBlueprint): void {
    blueprint
      .set('stone.auth.secret', getString('JWT_SECRET', 'dev-only-change-me'))
      .set('stone.auth.issuer', 'stone-blog-starter')
      .set('stone.auth.ttl', '1h')
  }
}
