import { routerBlueprint } from '@stone-js/router'
import { LogLevel, defineStoneApp } from '@stone-js/core'
import { nodeHttpAdapterBlueprint } from '@stone-js/node-http-adapter'

/**
 * Define Stone Application.
 */
export const Application = defineStoneApp(
  { name: 'MyApp', logger: { level: LogLevel.INFO } },
  [routerBlueprint, nodeHttpAdapterBlueprint]
)
