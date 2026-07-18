import { WelcomeService } from './services/WelcomeService'
import { routerBlueprint } from '@stone-js/router'
import { defineStoneReactApp } from '@stone-js/use-react'
import { browserAdapterBlueprint } from '@stone-js/browser-adapter'
import { nodeHttpAdapterBlueprint } from '@stone-js/node-http-adapter'
import { nodeConsoleAdapterBlueprint } from '@stone-js/node-cli-adapter'
import { LogLevel, defineService } from '@stone-js/core'

/**
 * Application — server-side rendering, imperative API.
 *
 * The imperative counterpart of the declarative SSR app: `defineStoneReactApp` wired with the
 * Node HTTP adapter (server render) + the browser adapter (client hydration) + the router.
 * The rendering strategy is pinned to `ssr` in `stone.config.mjs`.
 */
export const Application = defineStoneReactApp(
  { name: 'LabSsrImperative', logger: { level: LogLevel.INFO } },
  [routerBlueprint, browserAdapterBlueprint, nodeHttpAdapterBlueprint, nodeConsoleAdapterBlueprint]
)

/** Register the shared domain service (class form). */
export const Services = defineService(WelcomeService, { alias: 'welcomeService', isClass: true })
