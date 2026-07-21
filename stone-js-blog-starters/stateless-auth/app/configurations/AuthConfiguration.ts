import { getString } from '@stone-js/env'
import { authBlueprint } from '@stone-js/auth'
import { Configuration, IBlueprint, IConfiguration } from '@stone-js/core'

/**
 * AuthConfiguration
 *
 * Enables @stone-js/auth by merging its blueprint (service provider + the kernel middleware that
 * verifies the Bearer token), then configures the signing strategy. Here it is a shared HMAC
 * secret; swap it for `publicKey`/`jwksUri` to verify tokens from an external identity provider.
 *
 * `blueprint.set(object)` deep-merges, and provider/middleware arrays concatenate, so this adds to
 * the app rather than replacing the router or adapter contributions.
 */
@Configuration()
export class AuthConfiguration implements IConfiguration {
  configure (blueprint: IBlueprint): void {
    blueprint
      .set(authBlueprint)
      .set('stone.auth.secret', getString('JWT_SECRET', 'dev-only-change-me'))
      .set('stone.auth.issuer', 'stone-blog-starter')
      .set('stone.auth.ttl', '1h')
  }
}
