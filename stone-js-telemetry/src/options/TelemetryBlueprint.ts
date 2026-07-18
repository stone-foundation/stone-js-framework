import { TelemetryOptions } from '../declarations'
import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { TelemetryServiceProvider } from '../TelemetryServiceProvider'
import { TelemetryMiddleware } from '../middleware/TelemetryMiddleware'

/**
 * Telemetry configuration bucket (`stone.telemetry`).
 */
export interface TelemetryConfig extends TelemetryOptions {}

/**
 * Application config augmented with the telemetry bucket.
 */
export interface TelemetryAppConfig extends Partial<AppConfig> {
  telemetry: TelemetryConfig
}

/**
 * Blueprint for the telemetry module.
 */
export interface TelemetryBlueprint extends StoneBlueprint {
  stone: TelemetryAppConfig
}

/**
 * Opt-in blueprint: import and register it in your app to enable telemetry.
 *
 * It contributes the telemetry service provider and a kernel middleware that spans every
 * event. Both `stone.providers` and `stone.kernel.middleware` are arrays, so this merges
 * with the rest of the app rather than replacing anything.
 */
export const telemetryBlueprint: TelemetryBlueprint = {
  stone: {
    telemetry: {
      enabled: true,
      serviceName: 'stone-app'
    },
    providers: [
      TelemetryServiceProvider
    ],
    kernel: {
      middleware: [
        { module: TelemetryMiddleware, isClass: true }
      ]
    }
  }
}
