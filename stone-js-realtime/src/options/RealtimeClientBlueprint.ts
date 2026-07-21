import { StoneBlueprint } from '@stone-js/core'
import { RealtimeAppConfig } from './RealtimeBlueprint'
import { RealtimeClientServiceProvider } from '../RealtimeClientServiceProvider'

/**
 * Blueprint for the realtime client (frontend).
 */
export interface RealtimeClientBlueprint extends StoneBlueprint {
  stone: RealtimeAppConfig
}

/**
 * Opt-in blueprint for the frontend: register it to enable the isomorphic realtime client.
 *
 * It contributes the {@link RealtimeClientServiceProvider}, which binds `realtime` to a
 * {@link RealtimeClient} built from `stone.realtime.url`. `stone.providers` is an array, so this
 * merges with the rest of the app configuration.
 */
export const realtimeClientBlueprint: RealtimeClientBlueprint = {
  stone: {
    realtime: {},
    providers: [
      RealtimeClientServiceProvider
    ]
  }
}
