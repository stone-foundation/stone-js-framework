import { Routing } from '@stone-js/router'
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { StoneApp, LogLevel } from '@stone-js/core'
import { NodeHttp, MetaBodyEventMiddleware } from '@stone-js/node-http-adapter'

/**
 * Application — the Stone.js entry point for the REST API lab.
 *
 * - `@StoneApp()` enables the application (mandatory).
 * - `@Routing()` turns the router into the event handler (N routes instead of one handler).
 * - `@NodeHttp()` runs it on a Node HTTP server; `MetaBodyEventMiddleware` parses JSON bodies.
 * - `@NodeConsole()` exposes the CLI (dev/build/route list...).
 *
 * Routes live in the controllers (see TasksController); nothing else is needed here.
 */
@Routing()
@NodeConsole()
@StoneApp({ name: 'LabRestApi', logger: { level: LogLevel.INFO } })
@NodeHttp({ default: true, middleware: [MetaBodyEventMiddleware] })
export class Application {}
