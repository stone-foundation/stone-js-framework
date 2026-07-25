import { I18nOptions } from '../declarations'
import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { I18nServiceProvider } from '../I18nServiceProvider'
import { MetaSetLocaleMiddleware } from '../middleware/SetLocaleMiddleware'

/**
 * The `stone.i18n` configuration bucket.
 */
export interface I18nModuleConfig extends I18nOptions {}

/**
 * Application config augmented with the i18n bucket.
 */
export interface I18nAppConfig extends Partial<AppConfig> {
  i18n: I18nModuleConfig
}

/**
 * Blueprint for the i18n module.
 */
export interface I18nBlueprint extends StoneBlueprint {
  stone: I18nAppConfig
}

/**
 * The shared i18n contribution: the {@link I18nServiceProvider} (binds `i18n`) and the kernel
 * middleware that resolves the request locale. It carries NO Node-only filesystem autoloader, so
 * both the backend and the browser build on it. Import the ready-made `i18nBlueprint` instead (it
 * adds the zero-config `app/i18n` autoloader on the backend). `stone.providers` and
 * `stone.kernel.middleware` are arrays, so this merges with the rest of the app.
 */
export const baseI18nBlueprint: I18nBlueprint = {
  stone: {
    i18n: {},
    providers: [
      I18nServiceProvider
    ],
    kernel: {
      middleware: [
        MetaSetLocaleMiddleware
      ]
    }
  }
}

/**
 * Build an i18n configuration fragment imperatively (for `defineConfig`/meta-modules).
 *
 * @param config - The i18n configuration.
 * @returns A partial app config carrying the `i18n` bucket.
 *
 * @example
 * ```typescript
 * export const AppConfig = defineConfig(defineI18n({
 *   locale: 'en',
 *   locales: ['en', 'fr'],
 *   fallbackLocale: 'en'
 * }))
 * ```
 */
export function defineI18n (config: I18nModuleConfig): { i18n: I18nModuleConfig } {
  return { i18n: config }
}
