import { RateLimitConfig } from '../declarations'
import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { RateLimitServiceProvider } from '../RateLimitServiceProvider'
import { MetaThrottleRouteMiddleware } from '../middleware/ThrottleRouteMiddleware'

/** Application config augmented with the rate-limit bucket. */
export interface RateLimitAppConfig extends Partial<AppConfig> {
  rateLimit: RateLimitConfig
}

/** Blueprint for the rate-limit module. */
export interface RateLimitBlueprint extends StoneBlueprint {
  stone: RateLimitAppConfig
}

/**
 * Opt-in blueprint: register it to enable rate limiting.
 *
 * It contributes the provider that builds the limiters and the route middleware that enforces what a
 * route declared. `rateLimit` is declared composable, so a budget on a group holds for every child on
 * top of the child's own: a platform-wide ceiling and a per-route limit are two different promises,
 * and both should be kept.
 */
export const rateLimitBlueprint: RateLimitBlueprint = {
  stone: {
    rateLimit: {},
    providers: [
      RateLimitServiceProvider
    ],
    router: {
      middleware: [
        MetaThrottleRouteMiddleware
      ],
      composableProps: ['rateLimit']
    }
  }
}
