import { Routing } from '@stone-js/router'
import { UseReact } from '@stone-js/use-react'
import { Browser } from '@stone-js/browser-adapter'
import { NodeHttp } from '@stone-js/node-http-adapter'
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { StoneApp, LogLevel } from '@stone-js/core'

/**
 * Application — static site generation.
 *
 * Same isomorphic setup as the SSR variant, but `stone.config.mjs` pins `rendering: 'ssg'` and
 * lists the routes to pre-render to static HTML at build time (`/` and `/about`). The generated
 * pages are still hydrated by `@Browser()` in the client. Same pages as the SPA and SSR variants.
 */
@Routing()
@Browser()
@UseReact()
@NodeConsole()
@NodeHttp({ default: true })
@StoneApp({ name: 'LabSsg', logger: { level: LogLevel.INFO } })
export class Application {}
