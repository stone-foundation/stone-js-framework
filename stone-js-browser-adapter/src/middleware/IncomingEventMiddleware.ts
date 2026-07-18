import { BROWSER_PLATFORM } from '../constants'
import { IBlueprint, NextMiddleware } from '@stone-js/core'
import { BrowserAdapterError } from '../errors/BrowserAdapterError'
import { CookieCollection, CookieOptions } from '@stone-js/browser-core'
import { BrowserAdapterResponseBuilder, BrowserAdapterContext } from '../declarations'

/**
 * Middleware for handling incoming events and transforming them into Stone.js events.
 *
 * This class processes incoming HTTP requests, extracting relevant data such as URL, IP addresses,
 * headers, cookies, and more, and forwards them to the next middleware in the pipeline.
 */
export class IncomingEventMiddleware {
  /**
   * The blueprint for resolving configuration and dependencies.
   */
  private readonly blueprint: IBlueprint

  /**
   * Create an IncomingEventMiddleware instance.
   *
   * @param {blueprint} options - Options containing the blueprint for resolving configuration and dependencies.
   */
  constructor ({ blueprint }: { blueprint: IBlueprint }) {
    this.blueprint = blueprint
  }

  /**
   * Handles the incoming event, processes it, and invokes the next middleware in the pipeline.
   *
   * @param context - The adapter context containing the raw event, execution context, and other data.
   * @param next - The next middleware to be invoked in the pipeline.
   * @returns A promise that resolves to the processed context.
   * @throws {BrowserAdapterError} If required components are missing in the context.
   */
  async handle (context: BrowserAdapterContext, next: NextMiddleware<BrowserAdapterContext, BrowserAdapterResponseBuilder>): Promise<BrowserAdapterResponseBuilder> {
    if ((context.rawEvent === undefined) || ((context.incomingEventBuilder?.add) === undefined) || context.executionContext === undefined) {
      throw new BrowserAdapterError('The context is missing required components.')
    }

    context
      .incomingEventBuilder
      .add('source', this.getSource(context))
      .add('url', new URL(context.executionContext.location.href))
      .add('queryString', context.executionContext.location.search)
      .add('protocol', context.executionContext.location.protocol.replace(':', ''))
      .add('metadata', (context.rawEvent as CustomEvent).detail ?? (context.rawEvent as PopStateEvent).state)
      .add('cookies', CookieCollection.create(context.executionContext.document.cookie, this.getCookieOptions(), context.executionContext.document))

    return await next(context)
  }

  /**
   * Create the IncomingEventSource from the context.
   *
   * @param context - The adapter context containing the raw event, execution context, and other data.
   * @returns The Incoming Event Source.
   */
  private getSource (context: BrowserAdapterContext): unknown {
    return {
      rawEvent: context.rawEvent,
      platform: BROWSER_PLATFORM,
      rawContext: context.executionContext
    }
  }

  /**
   * Retrieves cookie-related options from the blueprint.
   *
   * @returns Cookie options.
   */
  private getCookieOptions (): CookieOptions {
    return this.blueprint.get<CookieOptions>('stone.browser.cookie.options', {})
  }
}

/**
 * Meta Middleware for processing incoming events.
 */
export const MetaIncomingEventMiddleware = { module: IncomingEventMiddleware, isClass: true }
