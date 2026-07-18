import { routerBlueprint } from '@stone-js/router'
import { browserAdapterBlueprint } from '@stone-js/browser-adapter'
import { nodeHttpAdapterBlueprint } from '@stone-js/node-http-adapter'
import { nodeConsoleAdapterBlueprint } from '@stone-js/node-cli-adapter'
import { defineStoneReactApp, ReactLifecycleHookType } from '@stone-js/use-react'
import { defineHookListeners, IBlueprint, IContainer, ILogger, LogLevel, Promiseable } from '@stone-js/core'

/**
 * Start the application
 * Run at each cold start.
 * At this point, you only have access to the blueprint.
 * Because the container is not yet created.
 */
export function onStart ({ blueprint }: { blueprint: IBlueprint }): void {
  const AppName = blueprint.get<string>('stone.name')
  console.log(`${String(AppName)}'s Application is starting`)
}

/**
 * Prepare the application
 * Run at each warm start in server context.
 * And at each cold start in browser context.
 */
export function onInit ({ logger }: { logger: ILogger }): Promiseable<void> {
  logger.info('Application is initializing')
}

/**
 * Before handle the incoming event
 */
export function onHandlingEvent ({ logger }: { logger: ILogger }): Promiseable<void> {
  logger.info('Before handle incoming event')
}

/**
 * Before prepare the react page
 */
export function onPreparingPage ({ container }: { container: IContainer }): Promiseable<void> {
  container.make<ILogger>('logger').info('Before prepare the react page')
}

/**
 * After the incoming event has been processed
 */
export function onProcessingKernelMiddleware ({ pipe }: { pipe: any }): Promiseable<void> {
  console.info('Kernel middleware is processing', pipe.module.name)
}

/**
 * After the platform event has been sent to the user
 */
export function onTerminate ({ logger }: { logger: ILogger }): Promiseable<void> {
  logger.info('The event has been sent to the user')
}

/**
 * Stone-React Application
 */
export const MyStoneReactApp = defineStoneReactApp(
  { name: 'My Stone', logger: { level: LogLevel.DEBUG } },
  [
    routerBlueprint,
    browserAdapterBlueprint,
    nodeHttpAdapterBlueprint,
    nodeConsoleAdapterBlueprint
  ]
)

/**
 * Hooks Listeners Blueprint
 */
export const HooksListenersBlueprint = defineHookListeners<ReactLifecycleHookType>({
  onInit: [onInit],
  onStart: [onStart],
  onTerminate: [onTerminate],
  onPreparingPage: [onPreparingPage],
  onHandlingEvent: [onHandlingEvent],
  onProcessingKernelMiddleware: [onProcessingKernelMiddleware]
})
