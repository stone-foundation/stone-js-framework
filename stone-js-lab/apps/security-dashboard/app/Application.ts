import { Routing } from '@stone-js/router'
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { StoneApp, LogLevel } from '@stone-js/core'
import { NodeHttp, MetaBodyEventMiddleware } from '@stone-js/node-http-adapter'

/**
 * Application — the security & runtime metrics dashboard.
 *
 * A plain Node HTTP service (`@Routing` + `@NodeHttp`) that consumes `@stone-js/telemetry`:
 * telemetry is wired by TelemetryConfiguration (see it) which registers the module's provider +
 * middleware and plugs a shared in-memory exporter. `MetaBodyEventMiddleware` parses the login
 * form body. The dashboard, metrics API and login live in DashboardController.
 */
@Routing()
@NodeConsole()
@StoneApp({ name: 'SecurityDashboard', logger: { level: LogLevel.INFO } })
@NodeHttp({ default: true, middleware: [MetaBodyEventMiddleware] })
export class Application {}
