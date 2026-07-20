import { AuthOptions } from '../declarations'
import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { AuthServiceProvider } from '../AuthServiceProvider'
import { AuthenticateMiddleware } from '../middleware/AuthenticateMiddleware'

/**
 * Authentication configuration bucket (`stone.auth`).
 */
export interface AuthConfig extends AuthOptions {}

/**
 * Application config augmented with the auth bucket.
 */
export interface AuthAppConfig extends Partial<AppConfig> {
  auth: AuthConfig
}

/**
 * Blueprint for the auth module.
 */
export interface AuthBlueprint extends StoneBlueprint {
  stone: AuthAppConfig
}

/**
 * Opt-in blueprint: import and register it to enable authentication.
 *
 * It contributes the auth service provider and a kernel middleware that authenticates every
 * request from its Bearer token (populating `event.getUser()` when present). Both `stone.providers`
 * and `stone.kernel.middleware` are arrays, so this merges with the rest of the app. Configure
 * keys/issuer/audience under `stone.auth`; enforce access per route with `requireAuth()` /
 * `requireScopes()`.
 */
export const authBlueprint: AuthBlueprint = {
  stone: {
    auth: {},
    providers: [
      AuthServiceProvider
    ],
    kernel: {
      middleware: [
        { module: AuthenticateMiddleware, isClass: true }
      ]
    }
  }
}
