import { NODE_CONSOLE_PLATFORM } from '@stone-js/node-cli-adapter'

/**
 * The React client template.
 * This template is used to create the client entry point for a React application.
 * Note: This file is embedded in the index.html file.
 */
export const reactClientEntryPointTemplate = (
  path = './app/**/*.{ts,js,mjs,json}'
): string => `
import { stoneApp } from '@stone-js/core'

/**
 * Import application modules.
 */
// @ts-ignore
const rawModules = import.meta.glob('${path}', { eager: true })
const modules = Object
  .values(rawModules)
  // @ts-ignore
  .flatMap(Object.values)
  // %concat%

/**
 * Create and run the Stone app.
 * Note: no top-level await here. TLA requires ES2022 (Safari 16.4+) and
 * esbuild cannot lower it. Nothing awaits this entry point in a browser anyway.
 */
export const stone = stoneApp({ modules }).run().catch((error) => {
  console.error('[Stone.js] Failed to start the application.', error)
})
`

/**
 * The React server template.
 * This template is used to create the server entry point for a React application.
 * Note: This file is used to create th SSR server to run the application.
 */
export const reactServerEntryPointTemplate = (
  path = './app/**/*',
  printUrls: boolean | string = true
): string => `
import { stoneApp } from '@stone-js/core'

/**
 * Import application modules.
 */
// @ts-ignore
const rawModules = import.meta.glob('${path}', { eager: true })
const modules = Object
  .values(rawModules)
  // @ts-ignore
  .flatMap(Object.values)

/**
 * Create and run the Stone app.
 */
export const stone = await stoneApp({
  modules
})
.configure({
  afterConfigure (blueprint) {
    blueprint.setIf('stone.adapter.printUrls', ${String(printUrls)})
    // %blueprint%
  }
})
.run()
`

/**
 * The React console template.
 * This template is used to create the console entry point for a React application.
 * Note: This file is used to create the console server to run the application.
 */
export const reactConsoleEntryPointTemplate = (
  path = './app/**/*',
  platform: string = NODE_CONSOLE_PLATFORM
): string => `
import { stoneApp } from '@stone-js/core'

/**
 * Import application modules.
 */
// @ts-expect-error
const rawModules = import.meta.glob('${path}', { eager: true })
const modules = Object
  .values(rawModules)
  // @ts-ignore
  .flatMap(Object.values)

/**
 * Create and run the Stone app.
 */
export const stone = await stoneApp({
  modules
})
.configure((blueprint) => {
  blueprint.set('stone.adapter.platform', '${platform}')
})
.run()
`

/**
 * The React template.
 * This template is used to create the entry point for a React application.
 */
export const reactHtmlEntryPointTemplate = (
  mainScript = '<script type="module" src="/.stone/index.mjs"></script>',
  mainCSS = '<link rel="stylesheet" href="/assets/css/index.css" />'
): string => `
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Stone.js + React</title>
    ${mainCSS}
    <!--env-js-->
    <!--app-head-->
  </head>
  <body>
    <div id="root"><!--app-html--></div>
    ${mainScript}
  </body>
</html>
`

/**
 * The Vite server template.
 * This template is used to create the server entry point for a Vite application.
 */
export const viteDevServerTemplate = (serverName: string = 'runDevServer'): string => `
import { ${serverName} } from '@stone-js/cli'

const server = await ${serverName}()

const shutdown = async (signal) => {
  await server.close()
  process.exit(0)
}

process.on("SIGINT", shutdown)
process.on("SIGTERM", shutdown)
`
