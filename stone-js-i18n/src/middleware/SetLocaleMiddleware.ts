import { I18nManager } from '../I18nManager'
import { negotiate, resolveLocale } from '../resolveLocale'
import { I18nOptions, Locale, LocaleAwareEvent, LocaleResolutionOptions } from '../declarations'
import { IBlueprint, IContainer, IncomingEvent, NextMiddleware, OutgoingResponse, type MetaMiddleware } from '@stone-js/core'

/** Duck-typed router/route, so i18n never imports `@stone-js/router` (stays platform-agnostic). */
interface RouterLike {
  findRoute: (event: unknown) => Promise<RouteLike | undefined>
}
interface RouteLike {
  bind: (event: unknown) => Promise<void>
  getParam: <T = string>(name: string, fallback?: T) => T | undefined
}

/**
 * Kernel middleware that resolves the request locale and scopes i18n to it.
 *
 * Resolution: a path-based locale via the router (a `:lang` route param) when a `param` is
 * configured and the router is available in the container — isomorphic, works on the backend and the
 * frontend — then the event sources (custom headers → query → cookie → `Accept-Language` → the
 * event's locale → fallback). The result is stored on the event: `locale` (the string) and `i18n` (a
 * request-bound, concurrency-safe translator). Read them via `translatorFor`/`localeFromEvent`.
 *
 * The request's own i18n instance is moved to that locale too, so code that never sees the event still
 * translates in the caller's language: an injected `{ i18n }`, the `i18next` binding, the helpers. That
 * is sound here and would not be in a framework with a long-lived container, because Stone.js builds
 * the kernel and its container per event: the instance being moved belongs to this request only.
 */
export class SetLocaleMiddleware {
  private readonly i18n: I18nManager
  private readonly container: IContainer
  private readonly options: LocaleResolutionOptions
  /**
   * The locale the application was configured with, read once.
   *
   * The last resort of the resolution chain, and read here rather than from the instance on purpose:
   * the instance is moved to each request's locale, so asking it would make one caller's language the
   * next caller's default. That cannot happen on a per-request kernel, and it is exactly what would
   * happen wherever an instance outlives one event, a browser application above all.
   */
  private readonly configuredLocale: Locale

  /**
   * @param dependencies - Auto-wired container services.
   */
  constructor ({ i18n, blueprint, container }: { i18n: I18nManager, blueprint: IBlueprint, container: IContainer }) {
    this.i18n = i18n
    this.container = container
    this.configuredLocale = i18n.configuredLocale
    const config = blueprint.get<I18nOptions>('stone.i18n', {})
    const fallback = Array.isArray(config.fallbackLocale) ? config.fallbackLocale[0] : config.fallbackLocale
    this.options = {
      locales: config.locales,
      // May be undefined: then `handle` falls back to the service's active locale.
      fallbackLocale: fallback ?? config.locale,
      param: config.param,
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
    const locale = await this.localeFromRoute(event) ??
      resolveLocale(event as LocaleAwareEvent, this.options) ??
      this.configuredLocale

    // Lazy catalogs: import the active locale before the handler renders, so there is no flash of
    // untranslated keys. A no-op unless `stone.i18n.loaders` were configured.
    await this.i18n.loadLocale(locale)

    // The request's own instance is moved to that locale, so everything that reads i18n without being
    // handed the event reads the right one: a service with `constructor ({ i18n })`, the `i18next`
    // binding, the `t()` helpers. It is the request's instance and nobody else's, because the kernel
    // and its container are built per event, which is what makes this safe rather than a leak between
    // concurrent requests.
    await this.i18n.setLocale(locale)

    event.setMetadataValue('locale', locale)
    // Still a bound clone on the event: it needs no ambient state at all, which is what keeps a page
    // rendered off the event correct even if something later moves the instance.
    event.setMetadataValue('i18n', this.i18n.forLocale(locale))
    return await next(event)
  }

  /**
   * Resolve a path-based locale (`:lang` route param). No-op unless a `param` is configured and the
   * router is bound; best-effort (any failure falls back to the event sources).
   *
   * @param event - The incoming event.
   * @returns The route locale, or `undefined`.
   */
  private async localeFromRoute (event: IncomingEvent): Promise<Locale | undefined> {
    if (this.options.param === undefined || !this.container.bound('router')) { return undefined }

    try {
      const route = await this.container.make<RouterLike>('router').findRoute(event)
      if (route === undefined) { return undefined }
      await route.bind(event)
      return negotiate(route.getParam<string>(this.options.param), this.options.locales)
    } catch {
      return undefined
    }
  }
}

/**
 * Meta middleware for resolving the request locale.
 */
export const MetaSetLocaleMiddleware: MetaMiddleware<IncomingEvent, OutgoingResponse> = { module: SetLocaleMiddleware, isClass: true }
