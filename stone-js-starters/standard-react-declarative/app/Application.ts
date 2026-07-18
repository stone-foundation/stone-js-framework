import { Routing } from '@stone-js/router'
import { UseReact } from '@stone-js/use-react'
import { Browser } from '@stone-js/browser-adapter'
import { NodeHttp } from '@stone-js/node-http-adapter'
import { StoneApp, AdapterHookListenerContext, Hook, LogLevel, Logger } from '@stone-js/core'

/**
 * Application
 *
 * This is the main application entry point.
 *
 * @UseReact() is used to enable the React.
 * @Browser() is used to enable the Browser adapter.
 * @Routing() is used to enable the routing feature.
 * @NodeHttp() is used to enable the Node HTTP adapter.
 * @StoneApp() is used to enable the Stone application, it is required.
 *
 * Lifecycle hooks are used here just for demonstration purposes.
 */
@Routing()
@Browser()
@UseReact()
@NodeHttp({ default: true })
@StoneApp({ name: 'MyApp', logger: { level: LogLevel.INFO } })
export class Application {
  /**
   * Run before the application starts
   *
   * @param blueprint - The blueprint
   */
  @Hook('onStart')
  onStart ({ blueprint }: AdapterHookListenerContext): void {
    Logger.log(`${String(blueprint.get('stone.name', 'Stone App'))} is starting...`)
  }

  /**
   * Run just before the application stops
   *
   * @param blueprint - The blueprint
   */
  @Hook('onStop')
  onStop ({ blueprint }: AdapterHookListenerContext): void {
    Logger.log(`${String(blueprint.get('stone.name', 'Stone App'))} is stopping...`)
  }
}
