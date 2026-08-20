import { REACT_NATIVE_PLATFORM } from '../constants'
import { CookieCollection, CookieOptions } from '@stone-js/browser-core'
import { ReactNativeAdapterError } from '../errors/ReactNativeAdapterError'
import { IBlueprint, NextMiddleware, type MetaMiddleware } from '@stone-js/core'
import { ReactNativeAdapterContext, ReactNativeAdapterResponseBuilder } from '../declarations'

/**
 * Turns a navigation intent into the intention the kernel understands.
 *
 * This is the whole translation the Integration dimension owes the domain, and it is
 * deliberately the same event the browser produces: an `IncomingBrowserEvent`. A page
 * receives the same object whether it was reached by a link in a browser or by a deep
 * link on a phone, which is what lets a domain move between the two untouched.
 *
 * Two things differ from the browser, both because a native application has no document:
 * the URL comes from the intent rather than `window.location`, and the cookie collection
 * is in memory rather than backed by `document.cookie`.
 */
export class IncomingEventMiddleware {
  private readonly blueprint: IBlueprint

  /**
   * Create the middleware.
   *
   * @param options - Options containing the blueprint.
   */
  constructor ({ blueprint }: { blueprint: IBlueprint }) {
    this.blueprint = blueprint
  }

  /**
   * Handle the incoming intent.
   *
   * @param context - The adapter context.
   * @param next - The next middleware in the pipeline.
   * @returns The response builder.
   * @throws {ReactNativeAdapterError} When the context is missing required components.
   */
  async handle (
    context: ReactNativeAdapterContext,
    next: NextMiddleware<ReactNativeAdapterContext, ReactNativeAdapterResponseBuilder>
  ): Promise<ReactNativeAdapterResponseBuilder> {
    if (
      context.rawEvent === undefined ||
      context.executionContext === undefined ||
      context.incomingEventBuilder?.add === undefined
    ) {
      throw new ReactNativeAdapterError('The context is missing required components.')
    }

    const url = context.executionContext.resolveUrl(context.rawEvent.url)

    context
      .incomingEventBuilder
      .add('url', url)
      .add('queryString', url.search)
      .add('protocol', url.protocol.replace(':', ''))
      .add('metadata', context.rawEvent.metadata ?? {})
      .add('cookies', CookieCollection.create(undefined, this.getCookieOptions()))
      .add('source', {
        rawEvent: context.rawEvent,
        platform: REACT_NATIVE_PLATFORM,
        rawContext: context.executionContext
      })

    return await next(context)
  }

  /**
   * Retrieve cookie options from the blueprint.
   *
   * @returns The cookie options.
   */
  private getCookieOptions (): CookieOptions {
    return this.blueprint.get<CookieOptions>('stone.reactNative.cookie.options', {})
  }
}

/**
 * Meta middleware for processing navigation intents.
 */
export const MetaIncomingEventMiddleware: MetaMiddleware<any, any> = { module: IncomingEventMiddleware, isClass: true }
