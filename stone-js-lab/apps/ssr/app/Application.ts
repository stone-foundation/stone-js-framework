import { Routing } from '@stone-js/router'
import { UseReact } from '@stone-js/use-react'
import { Browser } from '@stone-js/browser-adapter'
import { NodeHttp } from '@stone-js/node-http-adapter'
import { NodeConsole } from '@stone-js/node-cli-adapter'
import { StoneApp, LogLevel } from '@stone-js/core'

/**
 * Application — server-side rendering.
 *
 * `@NodeHttp({ default: true })` renders each page to HTML on a Node server; `@Browser()` then
 * hydrates it in the client for full interactivity (isomorphic). The rendering strategy is
 * pinned to `ssr` in `stone.config.mjs`. Same pages as the SPA and SSG variants.
 */
@Routing()
@Browser()
@UseReact()
@NodeConsole()
@NodeHttp({ default: true })
@StoneApp({ name: 'LabSsr', logger: { level: LogLevel.INFO } })
export class Application {}
