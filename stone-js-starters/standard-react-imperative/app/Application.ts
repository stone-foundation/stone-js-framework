import { routerBlueprint } from '@stone-js/router'
import { defineStoneReactApp } from '@stone-js/use-react'
import { browserAdapterBlueprint } from '@stone-js/browser-adapter'
import { nodeHttpAdapterBlueprint } from '@stone-js/node-http-adapter'
import { AdapterHookListenerContext, LogLevel, Logger, defineHookListener } from '@stone-js/core'

/**
 * Run before the application starts
 *
 * @param blueprint - The blueprint
 */
export function onStartHandler ({ blueprint }: AdapterHookListenerContext): void {
  Logger.log(`${String(blueprint.get('stone.name', 'Stone App'))} is starting...`)
}

/**
 * Run just before the application stops
 *
 * @param blueprint - The blueprint
 */
export function onStopHandler ({ blueprint }: AdapterHookListenerContext): void {
  Logger.log(`${String(blueprint.get('stone.name', 'Stone App'))} is stopping...`)
}

/**
 * Define Stone Application.
 */
export const Application = defineStoneReactApp(
  { name: 'MyApp', logger: { level: LogLevel.INFO } },
  [
    routerBlueprint,
    browserAdapterBlueprint,
    nodeHttpAdapterBlueprint
  ]
)

/**
 * Application hooks blueprint.
 */
export const onStop = defineHookListener(onStopHandler, { name: 'onStop' })
export const onStart = defineHookListener(onStartHandler, { name: 'onStart' })
