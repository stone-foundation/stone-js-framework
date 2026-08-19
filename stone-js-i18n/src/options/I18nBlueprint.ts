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
 * Opt-in blueprint: import and register it to enable i18n.
 *
 * It contributes the {@link I18nServiceProvider} (binds `i18n` and the raw `i18next` instance) and a
 * kernel middleware that resolves the request locale. Fully isomorphic — no Node-only code — so the
 * exact same build runs on the backend and in the browser. Load translations with
 * `loadTranslations(import.meta.glob('/app/i18n/**', { eager: true }))` (bundler-driven, all formats,
 * tree-shakeable) or set `stone.i18n.resources`. `stone.providers` and `stone.kernel.middleware` are
 * arrays, so this merges with the rest of the app.
 */
export const i18nBlueprint: I18nBlueprint = {
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
