import { Routing } from '@stone-js/router'
import { UseReact } from '@stone-js/use-react'
import { Browser } from '@stone-js/browser-adapter'
import { NodeHttp } from '@stone-js/node-http-adapter'
import { StoneApp, LogLevel } from '@stone-js/core'

/**
 * The Stone.js website: a Stone.js application (use-react, SSG).
 * Dogfooding is the point: the site is built with what it documents.
 *
 * Adapters: Browser (SPA hydration) + NodeHttp (the SSR/SSG server). No CLI
 * adapter: a docs site is never a console app, and stacking NodeConsole made
 * the run-time collapse ambiguous, so the SSG server would not always listen.
 */
@Routing()
@Browser()
@UseReact()
@NodeHttp({ default: true })
@StoneApp({ name: 'StoneWebsite', logger: { level: LogLevel.INFO } })
export class Application {}
