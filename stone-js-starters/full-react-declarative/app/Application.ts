import { Routing } from '@stone-js/router'
import { Browser } from '@stone-js/browser-adapter'
import { Hook, UseReact } from '@stone-js/use-react'
import { NodeHttp } from '@stone-js/node-http-adapter'
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { IBlueprint, IContainer, ILogger, LogLevel, Promiseable, StoneApp } from '@stone-js/core'

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
 * You have access to the Stone's application lifecycle hooks.
 * You can also have access to them in the ServiceProviders.
 * They are optional and you can remove them if you don't need them.
 */
@Routing()
@Browser()
@UseReact()
@NodeConsole()
@NodeHttp({ default: true, url: 'http://localhost:3100' })
@StoneApp({ name: 'My Stone', logger: { level: LogLevel.DEBUG } })
export class Application {
  /**
   * Start the application
   * Run at each cold start.
   * At this point, you only have access to the blueprint.
   * Because the container is not yet created.
   */
  @Hook('onStart')
  onStart ({ blueprint }: { blueprint: IBlueprint }): void {
    const AppName = blueprint.get<string>('stone.name')
    console.log(`${String(AppName)}'s Application is starting`)
  }

  /**
   * Prepare the application
   * Run at each warm start in server context.
   * And at each cold start in browser context.
   */
  @Hook('onInit')
  onInit ({ logger }: { logger: ILogger }): Promiseable<void> {
    logger.info('Application is initializing')
  }

  /**
   * Before handle the incoming event
   */
  @Hook('onHandlingEvent')
  onHandlingEvent ({ logger }: { logger: ILogger }): Promiseable<void> {
    logger.info('Before handle incoming event')
  }

  /**
   * Before prepare the react page
   */
  @Hook('onPreparingPage')
  onPreparingPage ({ container }: { container: IContainer }): Promiseable<void> {
    container.make<ILogger>('logger').info('Before prepare the react page')
  }

  /**
   * After the incoming event has been processed
   */
  @Hook('onProcessingKernelMiddleware')
  onProcessingKernelMiddleware ({ pipe }: { pipe: any }): Promiseable<void> {
    console.info('Kernel middleware is processing', pipe.module.name)
  }

  /**
   * After the platform event has been sent to the user
   */
  @Hook('onTerminate')
  onTerminate ({ logger }: { logger: ILogger }): Promiseable<void> {
    logger.info('The event has been sent to the user')
  }
}
