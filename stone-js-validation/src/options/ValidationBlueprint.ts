import { ValidationOptions } from '../declarations'
import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { ValidationServiceProvider } from '../ValidationServiceProvider'

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
 * It contributes the validation service provider. `stone.providers` is an array, so this merges
 * with the rest of the app rather than replacing anything.
 */
export const validationBlueprint: ValidationBlueprint = {
  stone: {
    validation: {},
    providers: [
      ValidationServiceProvider
    ]
  }
}
