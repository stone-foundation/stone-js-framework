import { RouterErrorHandler } from '../RouterErrorHandler'
import { RouterServiceProvider } from '../RouterServiceProvider'
import { ClassDispatcher } from '../dispatchers/ClassDispatcher'
import { RouterOptions, StoneIncomingEvent } from '../declarations'
import { CallableDispatcher } from '../dispatchers/CallableDispatcher'
import { RedirectDispatcher } from '../dispatchers/RedirectDispatcher'
import { ComponentDispatcher } from '../dispatchers/ComponentDispatcher'
import { AppConfig, OutgoingResponse, StoneBlueprint } from '@stone-js/core'
import { metaRouterBlueprintMiddleware } from '../middleware/BlueprintMiddleware'
import { hostMatcher, methodMatcher, protocolMatcher, uriMatcher } from '../matchers'

/**
 * Defines the configuration options for the router.
 */
export interface RouterConfig<
  IncomingEventType extends StoneIncomingEvent = StoneIncomingEvent,
  OutgoingResponseType = unknown
> extends RouterOptions<IncomingEventType, OutgoingResponseType> {}

/**
 * Extends the base application configuration to include router-specific settings.
 */
export interface RouterAppConfig<
  IncomingEventType extends StoneIncomingEvent = StoneIncomingEvent,
  OutgoingResponseType = unknown
> extends Partial<AppConfig<IncomingEventType, OutgoingResponse>> {
  /** Router-specific configuration. */
  router: Partial<RouterConfig<IncomingEventType, OutgoingResponseType>>
}

/**
 * Blueprint for defining router-specific behavior and configuration.
 */
export interface RouterBlueprint<
  IncomingEventType extends StoneIncomingEvent = StoneIncomingEvent,
  OutgoingResponseType = unknown
> extends StoneBlueprint<IncomingEventType, OutgoingResponse> {
  /** Configuration and behavior definitions for the router application. */
  stone: RouterAppConfig<IncomingEventType, OutgoingResponseType>
}

/**
 * Default blueprint configuration for the router.
 */
export const routerBlueprint: RouterBlueprint = {
  stone: {
    blueprint: {
      middleware: metaRouterBlueprintMiddleware
    },
    kernel: {
      errorHandlers: {
        RouterError: {
          isClass: true,
          module: RouterErrorHandler
        },
        RouteNotFoundError: {
          isClass: true,
          module: RouterErrorHandler
        },
        MethodNotAllowedError: {
          isClass: true,
          module: RouterErrorHandler
        }
      }
    },
    providers: [
      RouterServiceProvider
    ],
    router: {
      rules: {},
      maxDepth: 5,
      maxUriLength: 2048,
      defaults: {},
      bindings: {},
      strict: false,
      matchers: [
        uriMatcher,
        hostMatcher,
        methodMatcher,
        protocolMatcher
      ],
      middleware: [],
      definitions: [],
      dispatchers: {
        class: ClassDispatcher,
        redirect: RedirectDispatcher,
        callable: CallableDispatcher,
        component: ComponentDispatcher
      },
      skipMiddleware: false
    }
  }
}
