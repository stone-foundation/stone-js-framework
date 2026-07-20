import { AuthzOptions } from '../declarations'
import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { AuthzServiceProvider } from '../AuthzServiceProvider'
import { AbilityMiddleware } from '../middleware/AbilityMiddleware'

/**
 * Authorization configuration bucket (`stone.authz`).
 */
export interface AuthzConfig extends AuthzOptions {}

/**
 * Application config augmented with the authz bucket.
 */
export interface AuthzAppConfig extends Partial<AppConfig> {
  authz: AuthzConfig
}

/**
 * Blueprint for the authz module.
 */
export interface AuthzBlueprint extends StoneBlueprint {
  stone: AuthzAppConfig
}

/**
 * Opt-in blueprint: import and register it to enable authorization.
 *
 * It contributes the authz service provider and a kernel middleware that builds the current
 * principal's ability and attaches it to every request. Both `stone.providers` and
 * `stone.kernel.middleware` are arrays, so this merges with the rest of the app. Configure
 * `stone.authz.resolveAbility` to build abilities from your users; guard routes with
 * `authorize(action, subject)`.
 */
export const authzBlueprint: AuthzBlueprint = {
  stone: {
    authz: {},
    providers: [
      AuthzServiceProvider
    ],
    kernel: {
      middleware: [
        { module: AbilityMiddleware, isClass: true }
      ]
    }
  }
}
