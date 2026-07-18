import { TaskService } from './TaskService'
import { getString } from '@stone-js/env'
import { AdapterConfig } from '@stone-js/core'
import { IncomingHttpEvent } from '@stone-js/http-core'
import { routerBlueprint, defineRoutes, GET, POST, DELETE } from '@stone-js/router'
import { nodeConsoleAdapterBlueprint } from '@stone-js/node-cli-adapter'
import { defineStoneApp, defineService, defineConfig, LogLevel, IBlueprint, ILogger, FunctionalEventHandler } from '@stone-js/core'
import { NODE_HTTP_PLATFORM, nodeHttpAdapterBlueprint, MetaBodyEventMiddleware } from '@stone-js/node-http-adapter'

/**
 * Imperative REST API — the SAME app as `rest-api` (declarative), written with the `define*`
 * meta-module API instead of decorators. No class-level metadata: the service is registered with
 * `defineService`, routes are plain factory handlers registered with `defineRoutes`, and the
 * platform is wired through blueprints. This is the 1:1 imperative counterpart proving Stone.js
 * exposes both paradigms at parity. Route params are raw strings in 0.8.0 → parsed with `Number`.
 */

/** Handler dependencies auto-wired from the container. */
interface Deps { tasks: TaskService, logger: ILogger }

/**
 * The Stone application: enable the app, plug the router (N routes), run on Node HTTP, expose CLI.
 */
export const Application = defineStoneApp(
  { name: 'LabRestApiImperative', logger: { level: LogLevel.INFO } },
  [routerBlueprint, nodeHttpAdapterBlueprint, nodeConsoleAdapterBlueprint]
)

/**
 * Register the domain service (class form, singleton) under the `tasks` alias so handlers can
 * destructure it from the container — the imperative equivalent of `@Service`.
 */
export const Services = defineService(TaskService, { alias: 'tasks', isClass: true, singleton: true })

/**
 * The routes — one factory handler per endpoint, mirroring the declarative controller exactly.
 * Returning a plain object serialises to JSON automatically (default 200).
 */
export const Routes = defineRoutes([
  [({ tasks }: Deps): FunctionalEventHandler<IncomingHttpEvent> =>
    () => tasks.list(),
  { isFactory: true, path: '/tasks', method: GET, name: 'tasks.list' }],

  [({ tasks }: Deps): FunctionalEventHandler<IncomingHttpEvent> =>
    (event) => tasks.find(Number(event.get('id', '0'))),
  { isFactory: true, path: '/tasks/:id(\\d+)', method: GET, name: 'tasks.show' }],

  [({ tasks, logger }: Deps): FunctionalEventHandler<IncomingHttpEvent> =>
    (event) => {
      const task = tasks.create(event.get('title', 'Untitled'))
      logger.info(`Created task #${task.id}`)
      return task
    },
  { isFactory: true, path: '/tasks', method: POST, name: 'tasks.create' }],

  [({ tasks }: Deps): FunctionalEventHandler<IncomingHttpEvent> =>
    (event) => tasks.toggle(Number(event.get('id', '0'))),
  { isFactory: true, path: '/tasks/:id(\\d+)/toggle', method: POST, name: 'tasks.toggle' }],

  [({ tasks }: Deps): FunctionalEventHandler<IncomingHttpEvent> =>
    (event) => { tasks.remove(Number(event.get('id', '0'))) },
  { isFactory: true, path: '/tasks/:id(\\d+)', method: DELETE, name: 'tasks.remove' }]
])

/**
 * Application configuration: make Node HTTP the default adapter and enable JSON body parsing —
 * the imperative equivalent of `@NodeHttp({ default: true, middleware: [MetaBodyEventMiddleware] })`.
 */
export const AppConfig = defineConfig({
  configure (blueprint: IBlueprint) {
    blueprint
      .get<AdapterConfig[]>('stone.adapters', [])
      .forEach((adapter: AdapterConfig) => {
        if (adapter.platform === NODE_HTTP_PLATFORM) { adapter.default = true }
      })
  },
  afterConfigure (blueprint: IBlueprint) {
    if (blueprint.is('stone.adapter.platform', NODE_HTTP_PLATFORM)) {
      blueprint
        .set('stone.adapter.url', getString('BASE_URL', 'http://localhost:8080'))
        .add('stone.adapter.middleware', [MetaBodyEventMiddleware])
    }
  }
})
