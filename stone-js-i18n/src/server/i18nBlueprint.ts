import { baseI18nBlueprint, I18nBlueprint } from '../options/I18nBlueprint'
import { metaServerI18nBlueprintMiddleware } from './BlueprintMiddleware'

/**
 * The i18n blueprint (backend): the shared contribution plus the zero-config `app/i18n` autoloader.
 *
 * Import and register it to enable i18n. Drop translations in `app/i18n/<locale>/<namespace>.json`
 * (e.g. `app/i18n/fr/common.json`) and they load automatically; override or extend via `stone.i18n`.
 */
export const i18nBlueprint: I18nBlueprint = {
  stone: {
    ...baseI18nBlueprint.stone,
    blueprint: { middleware: metaServerI18nBlueprintMiddleware }
  }
}
