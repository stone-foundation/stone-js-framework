import { EventHandler, Get, Post } from '@stone-js/router'
import { IAuthenticator, requireAuth, requireScopes } from '@stone-js/auth'
import { IncomingHttpEvent, JsonHttpResponse } from '@stone-js/http-core'

export interface AuthControllerOptions {
  authenticator: IAuthenticator
}

/**
 * AuthController
 *
 * `/login` mints a token (stand-in for real credential checking); the guarded routes are protected
 * by the kernel middleware that verified the token plus a per-route guard: `requireAuth()` rejects
 * anonymous calls with a 401, `requireScopes(...)` rejects a missing scope with a 403.
 */
@EventHandler('/')
export class AuthController {
  private readonly authenticator: IAuthenticator

  constructor ({ authenticator }: AuthControllerOptions) {
    this.authenticator = authenticator
  }

  /** Issue a signed token. A real app verifies credentials here first. */
  @Post('/login')
  @JsonHttpResponse(200)
  async login (event: IncomingHttpEvent): Promise<{ token: string }> {
    const { username = 'demo' } = event.get<{ username?: string }>('body', {})
    const token = await this.authenticator.sign({ sub: username, scope: 'tasks:write' })
    return { token }
  }

  /** The verified principal, available only with a valid token. */
  @Get('/me', { middleware: [requireAuth()] })
  @JsonHttpResponse(200)
  me (event: IncomingHttpEvent): unknown {
    return event.get('user') // the authenticated principal
  }

  /** A write that additionally demands the `tasks:write` scope. */
  @Post('/tasks', { middleware: [requireScopes('tasks:write')] })
  @JsonHttpResponse(201)
  createTask (event: IncomingHttpEvent): { created: boolean, by: unknown } {
    return { created: true, by: event.get('user') }
  }
}
