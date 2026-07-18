import { WelcomeService } from './services/WelcomeService'
import { routerBlueprint } from '@stone-js/router'
import { defineStoneReactApp } from '@stone-js/use-react'
import { browserAdapterBlueprint } from '@stone-js/browser-adapter'
import { nodeHttpAdapterBlueprint } from '@stone-js/node-http-adapter'
import { nodeConsoleAdapterBlueprint } from '@stone-js/node-cli-adapter'
import { LogLevel, defineService } from '@stone-js/core'

/**
 * Application — static site generation, imperative API.
 *
 * The imperative counterpart of the declarative SSG app: same isomorphic setup as the imperative
 * SSR app, but `stone.config.mjs` pins `rendering: 'ssg'` and lists the routes to pre-render to
 * static HTML at build time.
 */
export const Application = defineStoneReactApp(
  { name: 'LabSsgImperative', logger: { level: LogLevel.INFO } },
  [routerBlueprint, browserAdapterBlueprint, nodeHttpAdapterBlueprint, nodeConsoleAdapterBlueprint]
)

/** Register the shared domain service (class form). */
export const Services = defineService(WelcomeService, { alias: 'welcomeService', isClass: true })
