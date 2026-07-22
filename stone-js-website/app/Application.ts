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
 *
 * The SSG server binds 127.0.0.1 (IPv4) explicitly. With the default `localhost`
 * it binds ::1 on Linux CI (IPv6-first), while the SSG crawler fetches 127.0.0.1,
 * so pre-rendering could not reach the server ("fetch failed"). macOS masks this.
 */
@Routing()
@Browser()
@UseReact()
@NodeHttp({ default: true, url: 'http://127.0.0.1:8080' })
@StoneApp({ name: 'StoneWebsite', logger: { level: LogLevel.INFO } })
export class Application {}
