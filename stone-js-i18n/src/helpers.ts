import { I18n } from './I18n'
import { II18n, Locale, TranslateOptions } from './declarations'

/** A duck-typed event carrying request-scoped metadata. */
interface MetadataEvent {
  getMetadataValue?: <T = unknown>(key: string, fallback?: T) => T | undefined
}

/**
 * Translate a key using the process-wide instance (frontend / imperative use).
 *
 * @param key - The translation key.
 * @param options - Interpolation values, `count`, `ns`, one-off `locale`.
 * @returns The translated string.
 */
export function t (key: string, options?: TranslateOptions): string {
  return I18n.getInstance().t(key, options)
}

/**
 * The locale resolved for a request (set by `SetLocaleMiddleware`).
 *
 * @param event - The incoming event.
 * @returns The request locale, or `undefined` when unresolved.
 */
export function localeFromEvent (event: MetadataEvent): Locale | undefined {
  return event.getMetadataValue?.<Locale>('locale')
}

/**
 * The request-bound translator for an event (set by `SetLocaleMiddleware`), falling back to the
 * process-wide instance when the middleware did not run.
 *
 * @param event - The incoming event.
 * @returns A translator bound to the request locale.
 */
export function translatorFor (event: MetadataEvent): II18n {
  return event.getMetadataValue?.<II18n>('i18n') ?? I18n.getInstance()
}
