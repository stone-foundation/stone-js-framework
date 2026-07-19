import { IBlueprint, NextMiddleware } from '@stone-js/core'
import { AuthOptions, IAuthenticator, JwtClaims } from '../declarations'
import { IncomingHttpEvent, OutgoingHttpResponse } from '@stone-js/http-core'

/**
 * Kernel/route middleware that authenticates the request from its `Authorization: Bearer` token.
 *
 * If a token is present it is verified (an invalid/expired token raises `AuthenticationError` →
 * `401`); the verified claims are stored on the event (`auth` metadata) and the mapped principal
 * is exposed via `event.getUser()`. If no token is present the request continues anonymously —
 * enforce presence per route with `requireAuth()` / `requireScopes()`.
 */
export class AuthenticateMiddleware {
  private readonly authenticator: IAuthenticator
  private readonly resolveUser: (claims: JwtClaims) => unknown

  /**
   * @param dependencies - Auto-wired container services.
   */
  constructor ({ authenticator, blueprint }: { authenticator: IAuthenticator, blueprint: IBlueprint }) {
    this.authenticator = authenticator
    this.resolveUser = blueprint.get<AuthOptions>('stone.auth', {}).resolveUser ?? ((claims) => claims)
  }

  /**
   * @param event - The incoming event.
   * @param next - The next middleware.
   * @returns The outgoing response.
   */
  async handle (event: IncomingHttpEvent, next: NextMiddleware<IncomingHttpEvent, OutgoingHttpResponse>): Promise<OutgoingHttpResponse> {
    const token = String(event.get<string>('Authorization', '')).replace(/^Bearer\s+/i, '').trim()

    if (token.length > 0) {
      const claims = await this.authenticator.verify(token)
      const user = this.resolveUser(claims)
      event.setMetadataValue('auth', claims)
      event.setUserResolver(() => user)
    }

    return await next(event)
  }
}

/**
 * Meta middleware for authenticating incoming events.
 */
export const MetaAuthenticateMiddleware = { module: AuthenticateMiddleware, isClass: true }
