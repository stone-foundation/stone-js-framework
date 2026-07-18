import { Routing } from '@stone-js/router'
import { UseReact } from '@stone-js/use-react'
import { Browser } from '@stone-js/browser-adapter'
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { StoneApp, LogLevel } from '@stone-js/core'

/**
 * Application — SPA / client-side rendering.
 *
 * `@Browser()` is the only runtime adapter, so the app runs entirely in the browser (CSR).
 * `@Routing()` enables multi-page routing, `@UseReact()` the React view engine, `@NodeConsole()`
 * the CLI (dev/build). The rendering strategy is pinned to `csr` in `stone.config.mjs`.
 *
 * Pages live under `app/pages/*` (see HomePage, AboutPage).
 */
@Routing()
@Browser()
@UseReact()
@NodeConsole()
@StoneApp({ name: 'LabSpa', logger: { level: LogLevel.INFO } })
export class Application {}
