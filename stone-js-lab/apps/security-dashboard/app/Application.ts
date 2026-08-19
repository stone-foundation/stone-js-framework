import { Routing } from '@stone-js/router'
import { Telemetry } from '@stone-js/telemetry'
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { StoneApp, LogLevel } from '@stone-js/core'
import { NodeHttp, MetaBodyEventMiddleware } from '@stone-js/node-http-adapter'

/**
 * Application — the security & runtime metrics dashboard.
 *
 * A plain Node HTTP service (`@Routing` + `@NodeHttp`) that consumes `@stone-js/telemetry`:
 * `@Telemetry()` enables the module (its provider + kernel middleware), and TelemetryConfiguration
 * plugs the shared in-memory exporter the dashboard reads from. `MetaBodyEventMiddleware` parses
 * the login form body. The dashboard, metrics API and login live in DashboardController.
 */
@Routing()
@Telemetry({ serviceName: 'security-dashboard' })
@NodeConsole()
@StoneApp({ name: 'SecurityDashboard', logger: { level: LogLevel.INFO } })
@NodeHttp({ default: true, middleware: [MetaBodyEventMiddleware] })
export class Application {}
