import { RealtimeConfig, RealtimeGatewayMeta } from '../declarations'
import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { RealtimeServiceProvider } from '../RealtimeServiceProvider'

/**
 * The `stone.realtime` configuration bucket.
 */
export interface RealtimeModuleConfig extends RealtimeConfig {}

/**
 * Application config augmented with the realtime bucket.
 */
export interface RealtimeAppConfig extends Partial<AppConfig> {
  realtime: RealtimeModuleConfig
}

/**
 * Blueprint for the realtime module.
 */
export interface RealtimeBlueprint extends StoneBlueprint {
  stone: RealtimeAppConfig
}

/**
 * Opt-in blueprint: import and register it to enable realtime.
 *
 * It contributes the {@link RealtimeServiceProvider}, which binds `realtimeManager`, the default
 * connection as `realtime`, and the `realtimeRouter`. Configure connections/gateways under
 * `stone.realtime` (or use `@Realtime()` / `@RealtimeGateway()`). `stone.providers` is an array, so
 * this merges.
 */
export const realtimeBlueprint: RealtimeBlueprint = {
  stone: {
    realtime: {},
    providers: [
      RealtimeServiceProvider
    ]
  }
}

/**
 * Build a realtime configuration fragment imperatively (for `defineConfig`/meta-modules).
 *
 * @param config - The realtime configuration.
 * @returns A partial app config carrying the `realtime` bucket.
 */
export function defineRealtime (config: RealtimeModuleConfig): { realtime: RealtimeModuleConfig } {
  return { realtime: config }
}

/**
 * Build a gateway meta-module for imperative registration under `stone.realtime.gateways`.
 *
 * @param gateway - The gateway class (or handler function/instance/factory).
 * @param options - Whether it is a class/factory.
 * @returns A gateway meta-module.
 *
 * @example
 * ```typescript
 * defineRealtime({ gateways: [ defineRealtimeGateway(Chat, { isClass: true }) ] })
 * ```
 */
export function defineRealtimeGateway (
  gateway: unknown,
  options: { isClass?: boolean, isFactory?: boolean } = {}
): RealtimeGatewayMeta {
  return { module: gateway, ...options }
}
