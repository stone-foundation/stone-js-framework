import { CookieOptions } from '@stone-js/browser-core'
import { NavigationSource } from '../NavigationSource'
import { REACT_NATIVE_PLATFORM } from '../constants'
import { reactNativeAdapterResolver } from '../resolvers'
import { ReactNativeErrorHandler } from '../ReactNativeErrorHandler'
import { metaAdapterBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { MetaIncomingEventMiddleware } from '../middleware/IncomingEventMiddleware'
import { AdapterConfig, AppConfig, defaultKernelResolver, StoneBlueprint } from '@stone-js/core'

/**
 * Configuration for the React Native adapter.
 */
export interface ReactNativeAdapterAdapterConfig extends AdapterConfig {}

/**
 * The application configuration this adapter contributes.
 */
export interface ReactNativeAdapterConfig extends Partial<AppConfig> {
  adapters: ReactNativeAdapterAdapterConfig[]
  reactNative: {
    /**
     * The base URL an in-app path is resolved against. Defaults to `stone://app`.
     *
     * Set it to your application's own scheme when your deep links use one, so a link and
     * an in-app navigation resolve to the same origin.
     */
    baseUrl?: string

    /**
     * The navigation source. Left empty, one is created during the build phase and shared
     * with the router; supply your own to control the base URL or the linking module.
     */
    navigationSource?: NavigationSource

    cookie: {
      options: CookieOptions
    }
  }
}

/**
 * Blueprint for the React Native adapter.
 */
export interface ReactNativeAdapterBlueprint extends StoneBlueprint {
  stone: ReactNativeAdapterConfig
}

/**
 * The React Native adapter's blueprint.
 *
 * Zero configuration by default: the adapter listens to the platform's links, resolves
 * in-app paths against `stone://app`, and keeps cookies in memory. Every one of those is
 * a `stone.reactNative.*` key you can set.
 */
export const reactNativeAdapterBlueprint: ReactNativeAdapterBlueprint = {
  stone: {
    blueprint: {
      middleware: metaAdapterBlueprintMiddleware
    },
    reactNative: {
      cookie: {
        options: {}
      }
    },
    adapters: [
      {
        current: false,
        default: false,
        variant: 'native',
        platform: REACT_NATIVE_PLATFORM,
        middleware: [
          MetaIncomingEventMiddleware
        ],
        resolver: reactNativeAdapterResolver,
        eventHandlerResolver: defaultKernelResolver,
        errorHandlers: {
          default: { module: ReactNativeErrorHandler, isClass: true }
        }
      }
    ]
  }
}
