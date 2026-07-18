import {
  IncomingHttpEvent,
  OutgoingHttpResponse,
  IncomingHttpEventOptions
} from '@stone-js/http-core'
import {
  NodeHttp,
  MetaBodyEventMiddleware,
  MetaFilesEventMiddleware
} from '@stone-js/node-http-adapter'
import {
  Hook,
  isEmpty,
  StoneApp,
  LogLevel,
  IContainer,
  IBlueprint,
  AdapterContext,
  BlueprintContext,
  AdapterEventBuilderType,
  AdapterHookListenerContext
} from '@stone-js/core'
import { getString } from '@stone-js/env'
import { Routing } from '@stone-js/router'
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { PipelineHookContext } from '@stone-js/pipeline'

/**
 * Application
 *
 * This is the main application entry point.
 *
 * @StoneApp() is used to enable the Stone application, it is mandatory.
 * @Routing() is used to enable the routing feature.
 * @NodeHttp() is used to enable the Node HTTP adapter.
 * @NodeConsole() is used to enable the Node Console adapter.
 * @NodeConsole() requires the incoming event type.
 * BodyEventMiddleware is used to parse the incoming event body.
 * BodyEventMiddleware is imported because it is not installed by default.
 *
 * Note: In this example we implement the IBlueprintHook, IAdapterHook and IKernelHook interfaces for demonstration purposes.
 */
@Routing()
@NodeConsole()
@StoneApp({ name: 'MyApps', logger: { level: LogLevel.INFO } })
@NodeHttp({ default: true, middleware: [MetaBodyEventMiddleware, MetaFilesEventMiddleware], url: getString('BASE_URL', 'http://localhost:8080') })
export class Application {
  /**
   * Run before the blueprint is prepared
   *
   * @param context - The blueprint context
   */
  @Hook('onPreparingBlueprint')
  onPreparingBlueprint ({ blueprint, modules }: BlueprintContext): void {
    blueprint.set('tmpBlueprintTimer', Date.now())
    console.log(`Preparing blueprint by introspecting ${modules.length} modules...`)
  }

  /**
   * Run before each blueprint middleware is processed
   *
   * @param context - The pipeline context
   */
  @Hook('onProcessingBlueprintMiddleware')
  onProcessingBlueprintMiddleware ({ passable, pipe }: PipelineHookContext<BlueprintContext, IBlueprint>): void {
    passable.blueprint.set(`tmpBlueprintMiddleware.${String(pipe.module.name)}`, Date.now())
  }

  /**
   * Run after each blueprint middleware is processed
   *
   * @param context - The pipeline context
   */
  @Hook('onBlueprintMiddlewareProcessed')
  onBlueprintMiddlewareProcessed ({ passable, pipe }: PipelineHookContext<BlueprintContext, IBlueprint>): void {
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
  }

  /**
   * Run after the blueprint is prepared
   *
   * @param context - The blueprint context
   */
  @Hook('onBlueprintPrepared')
  onBlueprintPrepared ({ blueprint }: BlueprintContext): void {
    const timer = Date.now() - blueprint.get('tmpBlueprintTimer', 0)
    const middleware = Object.values(blueprint.get('tmpBlueprintMiddleware', {}))
    const message = `Blueprint prepared in ${timer}ms, with ${middleware.length} middleware`

    console.table(middleware)
    console.log(message)
  }

  /**
   * Run before the application starts
   *
   * @param context - The adapter context
   */
  @Hook('onStart')
  onStart ({ blueprint, context }: AdapterHookListenerContext): void {
    console.log('Starting application...')
    console.log('Context isEmpty?', isEmpty(context))
    console.log('Blueprint keys:', Object.keys(blueprint.all()).length)
  }

  /**
   * Run before each adapter middleware is processed
   *
   * @param context - The pipeline context
   */
  @Hook('onProcessingAdapterMiddleware')
  onProcessingAdapterMiddleware ({ passable, pipe, pipes }: PipelineHookContext<
  AdapterContext<unknown, unknown, unknown, IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse>,
  AdapterEventBuilderType<any>
  >): void {
    console.log('Processing adapter middleware...')
    console.log('Middleware count:', pipes.length)
    console.log('Middleware name:', pipe.name)
    console.log('IncomingEvent isEmpty?', isEmpty(passable.incomingEvent))
  }

  /**
   * Run after each adapter middleware is processed
   *
   * @param context - The pipeline context
   */
  @Hook('onAdapterMiddlewareProcessed')
  onAdapterMiddlewareProcessed ({ passable, pipe, pipes }: PipelineHookContext<
  AdapterContext<unknown, unknown, unknown, IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse>,
  AdapterEventBuilderType<any>
  >): void {
    console.log('Adapter middleware processed...')
    console.log('Middleware count:', pipes.length)
    console.log('Middleware name:', pipe.name)
    console.log('IncomingEvent isEmpty?', isEmpty(passable.incomingEvent))
  }

  /**
   * Run before building each incoming event
   *
   * @param context - The adapter context
   */
  @Hook('onBuildingIncomingEvent')
  onBuildingIncomingEvent ({ context }: AdapterHookListenerContext<
  AdapterContext<unknown, unknown, unknown, IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse>
  >): void {
    console.log('Building incoming event...')
    console.log('IncomingEvent isEmpty?', isEmpty(context?.incomingEvent))
  }

  /**
   * Run before handling each adapter error
   *
   * @param context - The adapter context
   */
  @Hook('onHandlingAdapterError')
  onHandlingAdapterError ({ error }: AdapterHookListenerContext<
  AdapterContext<unknown, unknown, unknown, IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse>
  >): void {
    console.error('Handling adapter error...')
    console.error('Error:', error)
  }

  /**
   * Run before building each outgoing response
   *
   * @param context - The adapter context
   */
  @Hook('onBuildingRawResponse')
  onBuildingRawResponse ({ context }: AdapterHookListenerContext<
  AdapterContext<unknown, unknown, unknown, IncomingHttpEvent, IncomingHttpEventOptions, OutgoingHttpResponse>
  >): void {
    console.log('Building raw response...')
    console.log('IncomingEvent isEmpty?', isEmpty(context?.incomingEvent))
    console.log('OutgoingResponse isEmpty?', isEmpty(context?.outgoingResponse))
  }

  /**
   * Run just before the application stops
   *
   * @param context - The adapter context
   */
  @Hook('onStop')
  onStop ({ blueprint, context }: AdapterHookListenerContext): void {
    console.log('Stopping application...')
    console.log('Context isEmpty?', isEmpty(context))
    console.log('Blueprint keys:', Object.keys(blueprint.all()).length)
  }

  /**
   * Run after the application is initialized
   * The container is available at this point.
   * All services are registered and ready to be used.
   *
   * @param container - The container
   */
  @Hook('onInit')
  onInit (container: IContainer): void {
    console.log('Initializing application...')
    console.log('Container services count:', container.getBindings().size)
  }

  /**
   * Run before handling each event
   *
   * @param container - The container
   */
  @Hook('onHandlingEvent')
  onHandlingEvent (container: IContainer): void {
    try {
      console.log('Handling event...')
      container.make('event')
    } catch (error: any) {
      console.log('The incoming event is not yet bound at this stage', error.message)
    }
  }

  /**
   * Run before processing each kernel middleware
   *
   * @param context - The pipeline context
   */
  @Hook('onProcessingKernelMiddleware')
  onProcessingKernelMiddleware (
    { passable, pipe, pipes }: PipelineHookContext<IncomingHttpEvent, OutgoingHttpResponse>
  ): void {
    console.log('Processing kernel middleware...')
    console.log('Middleware count:', pipes.length)
    console.log('Middleware name:', pipe.name)
    console.log('Incoming Source name', passable.source.platform)
  }

  /**
   * Run after processing each kernel middleware
   *
   * @param context - The pipeline context
   */
  @Hook('onKernelMiddlewareProcessed')
  onKernelMiddlewareProcessed (
    { passable, pipe, pipes }: PipelineHookContext<IncomingHttpEvent, OutgoingHttpResponse>
  ): void {
    console.log('Kernel middleware processed...')
    console.log('Middleware count:', pipes.length)
    console.log('Middleware name:', pipe.name)
    console.log('Incoming Source name', passable.source.platform)
  }

  /**
   * Run before executing each event handler
   *
   * @param container - The container
   */
  @Hook('onExecutingEventHandler')
  onExecutingEventHandler ({ event }: { event: IncomingHttpEvent }): void {
    console.log('Executing event handler...')
    console.log('The incoming event is yet bound at this stage', event.source.platform)
  }

  /**
   * Run before handling each error
   *
   * @param container - The container
   */
  @Hook('onExecutingErrorHandler')
  onExecutingErrorHandler ({ error }: { error: any }): void {
    console.log('Executing error handler...')
    console.log('Error', error)
  }

  /**
   * Run before preparing each response
   *
   * @param container - The container
   */
  @Hook('onPreparingResponse')
  onPreparingResponse ({ response }: { response: OutgoingHttpResponse }): void {
    console.log('Preparing response...')
    console.log('Response headers', response.headers)
  }

  /**
   * Run after preparing each response
   *
   * @param container - The container
   */
  @Hook('onResponsePrepared')
  onResponsePrepared ({ response }: { response: OutgoingHttpResponse }): void {
    console.log('Response prepared...')
    console.log('Response headers', response.headers)
  }

  /**
   * Run after handling each event
   *
   * @param context - The pipeline context
   */
  @Hook('onEventHandled')
  onEventHandled (
    { event, response }: { event: IncomingHttpEvent, response: OutgoingHttpResponse }
  ): void {
    console.log('Event handled...')
    console.log('Event headers', event.headers)
    console.log('Response headers', response.headers)
  }

  /**
   * Run after executing each event handler
   *
   * @param container - The container
   */
  @Hook('onTerminate')
  onTerminate (container: IContainer): void {
    console.log('Terminating event handling...')
    console.log('Is IncomingEvent exist', container.bound('event'))
    console.log('Is OutgoingResponse exist', container.bound('response'))
  }
}
