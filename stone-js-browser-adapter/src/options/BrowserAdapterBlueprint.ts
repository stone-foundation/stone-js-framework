import { BROWSER_PLATFORM, NAVIGATION_EVENT } from '../constants'
import { browserAdapterResolver } from '../resolvers'
import { CookieOptions } from '@stone-js/browser-core'
import { BrowserErrorHandler } from '../BrowserErrorHandler'
import { metaAdapterBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { MetaIncomingEventMiddleware } from '../middleware/IncomingEventMiddleware'
import { AdapterConfig, AppConfig, defaultKernelResolver, StoneBlueprint } from '@stone-js/core'

/**
 * Configuration interface for the Browser Adapter.
 *
 * Extends the `AdapterConfig` interface from the Stone.js framework and provides
 * customizable options specific to the Browser platform. This includes
 * alias, resolver, middleware, hooks, and various adapter state flags.
 */
export interface BrowserAdapterAdapterConfig extends AdapterConfig {
  /**
   * Browser-specific events that the adapter should listen for.
   */
  events: string[]
}

/**
 * Represents the BrowserAdapterConfig configuration options for the application.
 */
export interface BrowserAdapterConfig extends Partial<AppConfig> {
  adapters: BrowserAdapterAdapterConfig[]
  browser: {
    cookie: {
      options: CookieOptions
    }
  }
}

/**
 * Blueprint interface for the Browser Adapter.
 *
 * This interface extends `StoneBlueprint` and defines the structure of the
 * Browser adapter blueprint used in the Stone.js framework. It includes
 * a `stone` object with an array of `BrowserAdapterConfig` items.
 */
export interface BrowserAdapterBlueprint extends StoneBlueprint {
  stone: BrowserAdapterConfig
}

/**
 * Default blueprint configuration for the Browser Adapter.
 *
 * This blueprint defines the initial configuration for the Browser adapter
 * within the Stone.js framework. It includes:
 * - An alias for the Browser platform (`BROWSER_PLATFORM`).
 * - A default resolver function (currently a placeholder).
 * - Middleware, hooks, and state flags (`current`, `default`, `preferred`).
 */
export const browserAdapterBlueprint: BrowserAdapterBlueprint = {
  stone: {
    blueprint: {
      middleware: metaAdapterBlueprintMiddleware
    },
    browser: {
      cookie: {
        options: {}
      }
    },
    adapters: [
      {
        current: false,
        default: false,
        variant: 'browser',
        platform: BROWSER_PLATFORM,
        middleware: [
          MetaIncomingEventMiddleware
        ],
        resolver: browserAdapterResolver,
        eventHandlerResolver: defaultKernelResolver,
        events: ['popstate', NAVIGATION_EVENT],
        errorHandlers: {
          default: { module: BrowserErrorHandler, isClass: true }
        }
      }
    ]
  }
}
