import { RealtimeConfig } from '../declarations'
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
 * It contributes the {@link RealtimeServiceProvider}, which binds `realtimeManager` and the default
 * connection as `realtime`. Configure connections under `stone.realtime` (or use `@Realtime()`). The
 * listener side is the light key-router (`@RealtimeGateway`). `stone.providers` is an array, so this
 * merges.
 */
export const realtimeBlueprint: RealtimeBlueprint = {
  stone: {
    realtime: {},
    providers: [
      RealtimeServiceProvider
    ]
  }
}
