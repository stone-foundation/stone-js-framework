export const nanoApp = 
`
import { NodeHttp } from "@stone-js/node-http-adapter"
import { IncomingEvent, IEventHandler, StoneApp } from "@stone-js/core"

@NodeHttp()
@StoneApp()
export class App implements IEventHandler<IncomingEvent> {
  /**
   * Handle incoming events
   * 
   * @param event Incoming event
   * @returns response
  */
  handle(event: IncomingEvent): { message: string } {
    const message = \`Hello \${event.get<string>('name', 'World')}!\`

    // Return a JSON response
    return { message }
  }
}
`

export const macroApp = 
`
import { defineStoneApp, IncomingEvent } from "@stone-js/core"
import { nodeHttpAdapterBlueprint } from "@stone-js/node-http-adapter"

/**
 * Handle incoming events
 * 
 * @param event Incoming event
 * @returns response
*/
export const Handler = (event: IncomingEvent): { message: string } => {
  const message = \`Hello \${event.get<string>('name', 'World')}!\`

  // Return a JSON response
  return { message }
}

export const App = defineStoneApp(
  Handler, {}, [nodeHttpAdapterBlueprint]
)
`