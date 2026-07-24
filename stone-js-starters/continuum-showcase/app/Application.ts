import { Routing } from '@stone-js/router'
import { UseReact } from '@stone-js/use-react'
import { Browser } from '@stone-js/browser-adapter'
import { NodeHttp } from '@stone-js/node-http-adapter'
import { StoneApp, AdapterHookListenerContext, Hook, LogLevel, Logger } from '@stone-js/core'

/**
 * Application — the single entry point of the showcase.
 *
 * The whole point of the Continuum Architecture is here: you declare the CONTEXT once
 * (the adapters + features below) and the same domain (the `@Page` handlers) runs under it,
 * server-side and in the browser, unchanged.
 *
 * @NodeHttp() serves the pages over HTTP with server-side rendering.
 * @Browser() re-hydrates and runs the very same pages client-side.
 * @UseReact() plugs React in as the view engine.
 * @Routing() enables the universal router the `@Page` classes register on.
 * @StoneApp() bootstraps the application (required).
 */
@Routing()
@Browser()
@UseReact()
@NodeHttp({ default: true })
@StoneApp({ name: 'Stone.js Showcase', logger: { level: LogLevel.INFO } })
export class Application {
  /**
   * Run before the application starts.
   *
   * @param blueprint - The blueprint.
   */
  @Hook('onStart')
  onStart ({ blueprint }: AdapterHookListenerContext): void {
    Logger.log(`${String(blueprint.get('stone.name', 'Stone App'))} is starting...`)
  }

  /**
   * Run just before the application stops.
   *
   * @param blueprint - The blueprint.
   */
  @Hook('onStop')
  onStop ({ blueprint }: AdapterHookListenerContext): void {
    Logger.log(`${String(blueprint.get('stone.name', 'Stone App'))} is stopping...`)
  }
}
