import {
  IncomingHttpEvent,
  OutgoingHttpResponse,
  IncomingHttpEventOptions
} from '@stone-js/http-core'
import {
  isEmpty,
  LogLevel,
  IContainer,
  IBlueprint,
  defineConfig,
  AdapterConfig,
  defineStoneApp,
  AdapterContext,
  BlueprintContext,
  defineHookListener,
  AdapterEventBuilderType,
  AdapterHookListenerContext
} from '@stone-js/core'
import { getString } from '@stone-js/env'
import { routerBlueprint } from '@stone-js/router'
import { PipelineHookContext } from '@stone-js/pipeline'
import { nodeConsoleAdapterBlueprint } from '@stone-js/node-cli-adapter'
import { MetaBodyEventMiddleware, MetaFilesEventMiddleware, NODE_HTTP_PLATFORM, nodeHttpAdapterBlueprint } from '@stone-js/node-http-adapter'

/**
 * Run before the blueprint is prepared
 *
 * @param context - The blueprint context
 */
export const onPreparingBlueprint = defineHookListener(({ blueprint, modules }: BlueprintContext): void => {
  blueprint.set('tmpBlueprintTimer', Date.now())
  console.log(`Preparing blueprint by introspecting ${modules.length} modules...`)
}, { name: 'onPreparingBlueprint' })

/**
 * Run before each blueprint middleware is processed
 *
 * @param context - The pipeline context
 */
export const onProcessingBlueprintMiddleware = defineHookListener(({ passable, pipe }: PipelineHookContext<BlueprintContext, IBlueprint>): void => {
  passable.blueprint.set(`tmpBlueprintMiddleware.${String(pipe.module.name)}`, Date.now())
}, { name: 'onProcessingBlueprintMiddleware' })

/**
 * Run after each blueprint middleware is processed
 *
 * @param context - The pipeline context
 */
export const onBlueprintMiddlewareProcessed = defineHookListener(({ passable, pipe }: PipelineHookContext<BlueprintContext, IBlueprint>): void => {
  const name = `tmpBlueprintMiddleware.${String(pipe.module.name)}`
  const start = passable.blueprint.get(name, 0)
  const Type = pipe.isClass !== undefined ? 'Class' : pipe.isFactory !== undefined ? 'Factory' : pipe.isAlias !== undefined ? 'Alias' : 'Callable'
  const value = {
    Middleware: pipe.module.name,
    Type,
    Priority: pipe.priority,
    'Execution Time': `${Date.now() - start}ms`
  }

  passable.blueprint.set(name, value)
}, { name: 'onBlueprintMiddlewareProcessed' })

/**
 * Run after the blueprint is prepared
 *
 * @param context - The blueprint context
 */
export const onBlueprintPrepared = defineHookListener(({ blueprint }: BlueprintContext): void => {
  const timer = Date.now() - blueprint.get('tmpBlueprintTimer', 0)
  const middleware = Object.values(blueprint.get('tmpBlueprintMiddleware', {}))
  const message = `Blueprint prepared in ${timer}ms, with ${middleware.length} middleware`

  console.table(middleware)
  console.log(message)
}, { name: 'onBlueprintPrepared' })

/**
 * Run before the application starts
 *
 * @param context - The adapter context
 */
export const onStart = defineHookListener(({ blueprint, context }: AdapterHookListenerContext): void => {
  console.log('Starting application...')
  console.log('Context isEmpty?', isEmpty(context))
  console.log('Blueprint keys:', Object.keys(blueprint.all()).length)
}, { name: 'onStart' })

/**
 * Run before each adapter middleware is processed
 *
 * @param context - The pipeline context
 */
export const onProcessingAdapterMiddleware = defineHookListener(({ passable, pipe, pipes }: PipelineHookContext<
AdapterContext<unknown, unknown, unknown, IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse>,
AdapterEventBuilderType<any>
>): void => {
  console.log('Processing adapter middleware...')
  console.log('Middleware count:', pipes.length)
  console.log('Middleware name:', pipe.name)
  console.log('IncomingEvent isEmpty?', isEmpty(passable.incomingEvent))
}, { name: 'onProcessingAdapterMiddleware' })

/**
 * Run after each adapter middleware is processed
 *
 * @param context - The pipeline context
 */
export const onAdapterMiddlewareProcessed = defineHookListener(({ passable, pipe, pipes }: PipelineHookContext<
AdapterContext<unknown, unknown, unknown, IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse>,
AdapterEventBuilderType<any>
>): void => {
  console.log('Adapter middleware processed...')
  console.log('Middleware count:', pipes.length)
  console.log('Middleware name:', pipe.name)
  console.log('IncomingEvent isEmpty?', isEmpty(passable.incomingEvent))
}, { name: 'onAdapterMiddlewareProcessed' })

/**
 * Run before building each incoming event
 *
 * @param context - The adapter context
 */
export const onBuildingIncomingEvent = defineHookListener(({ context }: AdapterHookListenerContext<
AdapterContext<unknown, unknown, unknown, IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse>
>): void => {
  console.log('Building incoming event...')
  console.log('IncomingEvent isEmpty?', isEmpty(context?.incomingEvent))
}, { name: 'onBuildingIncomingEvent' })

/**
 * Run before handling each adapter error
 *
 * @param context - The adapter context
 */
export const onHandlingAdapterError = defineHookListener(({ error }: AdapterHookListenerContext<
AdapterContext<unknown, unknown, unknown, IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse>
>): void => {
  console.error('Handling adapter error...')
  console.error('Error:', error)
}, { name: 'onHandlingAdapterError' })

/**
 * Run before building each outgoing response
 *
 * @param context - The adapter context
 */
export const onBuildingRawResponse = defineHookListener(({ context }: AdapterHookListenerContext<
AdapterContext<unknown, unknown, unknown, IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse>
>): void => {
  console.log('Building raw response...')
  console.log('IncomingEvent isEmpty?', isEmpty(context?.incomingEvent))
  console.log('OutgoingResponse isEmpty?', isEmpty(context?.outgoingResponse))
}, { name: 'onBuildingRawResponse' })

/**
 * Run just before the application stops
 *
 * @param context - The adapter context
 */
export const onStop = defineHookListener(({ blueprint, context }: AdapterHookListenerContext): void => {
  console.log('Stopping application...')
  console.log('Context isEmpty?', isEmpty(context))
  console.log('Blueprint keys:', Object.keys(blueprint.all()).length)
}, { name: 'onStop' })

/**
 * Run after the application is initialized
 * The container is available at this point.
 * All services are registered and ready to be used.
 *
 * @param container - The container
 */
export const onInit = defineHookListener((container: IContainer): void => {
  console.log('Initializing application...')
  console.log('Container services count:', container.getBindings().size)
}, { name: 'onInit' })

/**
 * Run before handling each event
 *
 * @param container - The container
 */
export const onHandlingEvent = defineHookListener((container: IContainer): void => {
  try {
    console.log('Handling event...')
    container.make('event')
  } catch (error: any) {
    console.log('The incoming event is not yet bound at this stage', error.message)
  }
}, { name: 'onHandlingEvent' })

/**
 * Run before processing each kernel middleware
 *
 * @param context - The pipeline context
 */
export const onProcessingKernelMiddleware = defineHookListener((
  { passable, pipe, pipes }: PipelineHookContext<IncomingHttpEvent, OutgoingHttpResponse>
): void => {
  console.log('Processing kernel middleware...')
  console.log('Middleware count:', pipes.length)
  console.log('Middleware name:', pipe.name)
  console.log('Incoming Source name', passable.source.platform)
}, { name: 'onProcessingKernelMiddleware' })

/**
 * Run after processing each kernel middleware
 *
 * @param context - The pipeline context
 */
export const onKernelMiddlewareProcessed = defineHookListener((
  { passable, pipe, pipes }: PipelineHookContext<IncomingHttpEvent, OutgoingHttpResponse>
): void => {
  console.log('Kernel middleware processed...')
  console.log('Middleware count:', pipes.length)
  console.log('Middleware name:', pipe.name)
  console.log('Incoming Source name', passable.source.platform)
}, { name: 'onTerminate' })

/**
 * Run before executing each event handler
 *
 * @param container - The container
 */
export const onExecutingEventHandler = defineHookListener(({ event }: { event: IncomingHttpEvent }): void => {
  console.log('Executing event handler...')
  console.log('The incoming event is yet bound at this stage', event.source.platform)
}, { name: 'onExecutingEventHandler' })

/**
 * Run before handling each error
 *
 * @param container - The container
 */
export const onExecutingErrorHandler = defineHookListener(({ error }: { error: any }): void => {
  console.log('Executing error handler...')
  console.log('Error', error)
}, { name: 'onExecutingErrorHandler' })

/**
 * Run before preparing each response
 *
 * @param container - The container
 */
export const onPreparingResponse = defineHookListener(({ response }: { response: OutgoingHttpResponse }): void => {
  console.log('Preparing response...')
  console.log('Response headers', response.headers)
}, { name: 'onPreparingResponse' })

/**
 * Run after preparing each response
 *
 * @param container - The container
 */
export const onResponsePrepared = defineHookListener(({ response }: { response: OutgoingHttpResponse }): void => {
  console.log('Response prepared...')
  console.log('Response headers', response.headers)
}, { name: 'onResponsePrepared' })

/**
 * Run after handling each event
 *
 * @param context - The pipeline context
 */
export const onEventHandled = defineHookListener((
  { event, response }: { event: IncomingHttpEvent, response: OutgoingHttpResponse }
): void => {
  console.log('Event handled...')
  console.log('Event headers', event.headers)
  console.log('Response headers', response.headers)
}, { name: 'onEventHandled' })

/**
 * Run after executing each event handler
 *
 * @param container - The container
 */
export const onTerminate = defineHookListener((container: IContainer): void => {
  console.log('Terminating event handling...')
  console.log('Is IncomingEvent exist', container.bound('event'))
  console.log('Is OutgoingResponse exist', container.bound('response'))
}, { name: 'onTerminate' })

/**
 * Define Stone Application.
 */
export const Application = defineStoneApp(
  { name: 'MyApp', logger: { level: LogLevel.INFO } },
  [
    routerBlueprint,
    nodeHttpAdapterBlueprint,
    nodeConsoleAdapterBlueprint
  ]
)

/**
 * Application configuration.
 */
export const AppConfig = defineConfig({
  configure (blueprint: IBlueprint) {
    blueprint
      .get<AdapterConfig[]>('stone.adapters', [])
      .forEach((adapter: AdapterConfig) => {
        if (adapter.platform === NODE_HTTP_PLATFORM) {
          adapter.default = true
        }
      })
  },
  afterConfigure (blueprint: IBlueprint) {
    if (blueprint.is('stone.adapter.platform', NODE_HTTP_PLATFORM)) {
      blueprint
        .set('stone.adapter.url', getString('BASE_URL', 'http://localhost:8080'))
        .add('stone.adapter.middleware', [MetaBodyEventMiddleware, MetaFilesEventMiddleware])
    }
  }
})
