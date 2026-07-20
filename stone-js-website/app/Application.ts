import { Routing } from '@stone-js/router'
import { UseReact } from '@stone-js/use-react'
import { Browser } from '@stone-js/browser-adapter'
import { NodeHttp } from '@stone-js/node-http-adapter'
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { StoneApp, LogLevel } from '@stone-js/core'

/**
 * The Stone.js website: a Stone.js application (use-react, SSG).
 * Dogfooding is the point: the site is built with what it documents.
 */
@Routing()
@Browser()
@UseReact()
@NodeConsole()
@NodeHttp({ default: true })
@StoneApp({ name: 'StoneWebsite', logger: { level: LogLevel.INFO } })
export class Application {}
