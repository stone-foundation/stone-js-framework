import { HttpCorsConfig } from './HttpConfig'
import { AppConfig, StoneBlueprint } from '@stone-js/core'
import { IncomingHttpEvent } from '../IncomingHttpEvent'
import { OutgoingHttpResponse } from '../OutgoingHttpResponse'
import { EnsureCorsHeadersHook } from '../hooks/EnsureCorsHeadersHook'
import { MetaHandleCorsMiddleware } from '../middleware/HandleCorsMiddleware'

/**
 * Application config augmented with the pieces CORS needs.
 */
export interface CorsAppConfig extends Partial<AppConfig<IncomingHttpEvent, OutgoingHttpResponse>> {
  http?: { cors?: Partial<HttpCorsConfig> }
}

/**
 * Blueprint for cross-origin resource sharing.
 */
export interface CorsBlueprint extends StoneBlueprint<IncomingHttpEvent, OutgoingHttpResponse> {
  stone: CorsAppConfig
}

/**
 * Opt-in blueprint: register it to answer cross-origin requests.
 *
 * CORS is off until you ask for it, and `stone.http.cors.*` alone configures nothing: something has
 * to read that bucket. This blueprint is what does, on **both** dimensions, which is what CORS
 * actually requires:
 *
 * - **Kernel** ({@link MetaHandleCorsMiddleware}): the normal path. Every response the kernel
 *   produces, success or handled error, leaves with its CORS headers, and a preflight can be
 *   answered outright with `preflightStop`.
 * - **Adapter** ({@link EnsureCorsHeadersHook}, on `onBuildingRawResponse`): the last resort. When a
 *   request dies before or around the kernel (a malformed event, an adapter middleware that refuses
 *   it, an integration error), no kernel middleware ever ran, and a response without
 *   `Access-Control-Allow-Origin` is unreadable to the browser: the caller sees an opaque network
 *   error instead of the status you sent. The hook adds the headers to whatever response exists, and
 *   synthesizes one only when there is none at all.
 *
 * Both levels are needed for the same reason the framework has an error handler at both levels: a
 * failure in the Integration dimension never reaches the Initialization one.
 *
 * `stone.kernel.middleware` and `stone.lifecycleHooks.*` are arrays, so this merges with the rest of
 * the app. Configure with `blueprint.set('stone.http.cors', {...})` or through `@Cors({...})`.
 *
 * @example
 * ```typescript
 * import { corsBlueprint } from '@stone-js/http-core'
 *
 * export const Application = defineStoneApp(handler, { name: 'my-app' }, [corsBlueprint])
 * ```
 */
export const corsBlueprint: CorsBlueprint = {
  stone: {
    http: {
      cors: {}
    },
    kernel: {
      middleware: [
        MetaHandleCorsMiddleware
      ]
    },
    lifecycleHooks: {
      onBuildingRawResponse: [
        EnsureCorsHeadersHook
      ]
    }
  }
}
