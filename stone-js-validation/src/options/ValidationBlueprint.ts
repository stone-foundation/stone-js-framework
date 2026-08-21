import { ValidationOptions } from '../declarations'
import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { ValidationServiceProvider } from '../ValidationServiceProvider'
import { MetaValidateRouteMiddleware } from '../middleware/ValidateRouteMiddleware'

/**
 * Validation configuration bucket (`stone.validation`).
 */
export interface ValidationConfig extends ValidationOptions {}

/**
 * Application config augmented with the validation bucket.
 */
export interface ValidationAppConfig extends Partial<AppConfig> {
  validation: ValidationConfig
}

/**
 * Blueprint for the validation module.
 */
export interface ValidationBlueprint extends StoneBlueprint {
  stone: ValidationAppConfig
}

/**
 * Opt-in blueprint: import and register it to enable validation.
 *
 * It contributes the validation service provider and the route middleware that validates what a
 * route declared under `validation`. Both `stone.providers` and `stone.router.middleware` are
 * arrays, so this merges with the rest of the app rather than replacing anything.
 *
 * The route middleware is a no-op on routes that declare nothing, so enabling validation costs an
 * application that does not use it one function call per request.
 */
export const validationBlueprint: ValidationBlueprint = {
  stone: {
    validation: {},
    providers: [
      ValidationServiceProvider
    ],
    router: {
      middleware: [
        MetaValidateRouteMiddleware
      ]
    }
  }
}
