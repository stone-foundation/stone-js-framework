import { I18n } from '../I18n'
import { resolveLocale } from '../resolveLocale'
import { I18nOptions, LocaleAwareEvent, LocaleResolutionOptions } from '../declarations'
import { IBlueprint, IncomingEvent, NextMiddleware, OutgoingResponse, type MetaMiddleware } from '@stone-js/core'

/**
 * Kernel middleware that resolves the request locale and scopes i18n to it.
 *
 * The locale is resolved from the event (custom headers → query → cookie → `Accept-Language` → the
 * event's locale → fallback) and stored on the event: `locale` (the string) and `i18n` (a
 * request-bound, concurrency-safe translator). Read them via `localeFromEvent`/`translatorFor`, or
 * inject the app-wide `i18n` and call `i18n.forLocale(...)`.
 */
export class SetLocaleMiddleware {
  private readonly i18n: I18n
  private readonly options: LocaleResolutionOptions

  /**
   * @param dependencies - Auto-wired container services.
   */
  constructor ({ i18n, blueprint }: { i18n: I18n, blueprint: IBlueprint }) {
    this.i18n = i18n
    const config = blueprint.get<I18nOptions>('stone.i18n', {})
    const fallback = Array.isArray(config.fallbackLocale) ? config.fallbackLocale[0] : config.fallbackLocale
    this.options = {
      locales: config.locales,
      // May be undefined: then `handle` falls back to the service's active locale.
      fallbackLocale: fallback ?? config.locale,
      headers: config.headers,
      query: config.query,
      cookie: config.cookie,
      acceptLanguage: config.acceptLanguage,
      resolver: config.resolver
    }
  }

  /**
   * @param event - The incoming event.
   * @param next - The next middleware.
   * @returns The outgoing response.
   */
  async handle (event: IncomingEvent, next: NextMiddleware<IncomingEvent, OutgoingResponse>): Promise<OutgoingResponse> {
    const locale = resolveLocale(event as LocaleAwareEvent, this.options) ?? this.i18n.getLocale()
    event.setMetadataValue('locale', locale)
    event.setMetadataValue('i18n', this.i18n.forLocale(locale))
    return await next(event)
  }
}

/**
 * Meta middleware for resolving the request locale.
 */
export const MetaSetLocaleMiddleware: MetaMiddleware<IncomingEvent, OutgoingResponse> = { module: SetLocaleMiddleware, isClass: true }
