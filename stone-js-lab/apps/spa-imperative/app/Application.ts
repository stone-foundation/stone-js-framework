import { WelcomeService } from './services/WelcomeService'
import { routerBlueprint } from '@stone-js/router'
import { defineStoneReactApp } from '@stone-js/use-react'
import { browserAdapterBlueprint } from '@stone-js/browser-adapter'
import { nodeConsoleAdapterBlueprint } from '@stone-js/node-cli-adapter'
import { LogLevel, defineService } from '@stone-js/core'

/**
 * Application — SPA / client-side rendering, imperative API.
 *
 * The imperative counterpart of the declarative SPA: `defineStoneReactApp` (React view engine
 * built in) wired with only the browser adapter (CSR) + the console adapter (CLI) and the router.
 * Pages are registered via `definePage` (see app/pages), the service via `defineService`.
 * The rendering strategy is pinned to `csr` in `stone.config.mjs`.
 */
export const Application = defineStoneReactApp(
  { name: 'LabSpaImperative', logger: { level: LogLevel.INFO } },
  [routerBlueprint, browserAdapterBlueprint, nodeConsoleAdapterBlueprint]
)

/** Register the shared domain service (class form). */
export const Services = defineService(WelcomeService, { alias: 'welcomeService', isClass: true })
