import { baseI18nBlueprint, I18nBlueprint } from '../options/I18nBlueprint'

/**
 * The i18n blueprint (browser): the shared contribution only.
 *
 * There is no filesystem to scan in the browser, so translations come from `stone.i18n.resources`
 * (typically injected by your bundler from `app/i18n`) rather than from a runtime autoloader.
 */
export const i18nBlueprint: I18nBlueprint = baseI18nBlueprint
