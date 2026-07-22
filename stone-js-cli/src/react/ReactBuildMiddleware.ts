import { glob } from 'glob'
import fsExtra from 'fs-extra'
import { runSsg, collectStaticTargets, RouteDefinitionLike } from './ssg'
import { CliError } from '../errors/CliError'
import { relative } from 'node:path'
import { existsSync } from 'node:fs'
import { build, mergeConfig } from 'vite'
import { ConsoleContext } from '../declarations'
import { spawn, ChildProcess } from 'node:child_process'
import { PageRouteDefinition } from '@stone-js/router'
import { MetaPipe, NextPipe } from '@stone-js/pipeline'
import { removeImportsVitePlugin } from './RemoveImportsVitePlugin'
import { basePath, buildPath, distPath } from '@stone-js/filesystem'
import { isNotEmpty, IBlueprint, ClassType, isStoneBlueprint } from '@stone-js/core'
import { generatePublicEnvironmentsFile, isDeclarative, isLazyViews, isTypescriptApp } from '../utils'
import { generateDeclarativeLazyPages, generateImperativeLazyPages, getViteConfig } from './react-utils'
import { reactHtmlEntryPointTemplate, reactClientEntryPointTemplate, reactServerEntryPointTemplate } from './stubs'
import { MetaAdapterErrorPage, MetaErrorPage, MetaPageLayout, ReactIncomingEvent, UseReactBlueprint } from '@stone-js/use-react'

const { outputFileSync, moveSync, removeSync, readFileSync } = fsExtra

/**
 * Lazy: Generates an index file for all views in the application.
 *
 * @param context The console context.
 * @param next The next pipe function.
 * @returns The updated blueprint object.
 */
export const GenerateViewsIndexMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  if (!isLazyViews(context.blueprint, context.event)) {
    return await next(context)
  }

  context.commandOutput.info('Generating lazy pages...')

  let imports = ''
  let exportsMap = ''
  const path = buildPath('tmp/viewsIndex.mjs')
  const files = glob.sync(basePath(context.blueprint.get(
    'stone.builder.input.views', 'app/**/*.{tsx,jsx,mjsx}'
  )))

  files.forEach((filePath, index) => {
    const relFilePath = relative(buildPath('tmp'), filePath)
    const importName = `View${index}`
    imports += `import * as ${importName} from '${relFilePath}';\n`
    exportsMap += `  '${relFilePath}': ${importName},\n`
  })

  const value = `
    ${imports}
    export const views = {
      ${exportsMap}
    };
  `

  outputFileSync(path, value, 'utf-8')

  return await next(context)
}

/**
 * Lazy: Builds the views using Vite.
 *
 * @param context The console context.
 * @param next The next pipe function.
 * @returns The updated blueprint object.
*/
export const BuildViewsMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  if (!isLazyViews(context.blueprint, context.event)) {
    return await next(context)
  }

  const userConfig = await getViteConfig('build', 'production')

  const viteConfig = mergeConfig(userConfig, {
    build: {
      minify: false,
      target: 'esnext',
      sourcemap: false,
      lib: {
        formats: ['es'],
        entry: buildPath('tmp/viewsIndex.mjs')
      },
      rollupOptions: {
        output: {
          format: 'es',
          dir: buildPath('/tmp'),
          entryFileNames: '[name].mjs'
        }
      },
      emptyOutDir: false
    }
  })

  await build(viteConfig)

  return await next(context)
}

/**
 * Lazy: Generates a lazy pages file.
 *
 * @param context The console context.
 * @param next The next pipe function.
 * @returns The updated blueprint object.
 */
export const GenerateLazyPageMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  if (!isLazyViews(context.blueprint, context.event)) {
    return await next(context)
  }

  const definitions: PageRouteDefinition[] = []
  const layouts: Record<string, MetaPageLayout> = {}
  const errorPages: Record<string, MetaErrorPage<ReactIncomingEvent>> = {}
  const adapterErrorPages: Record<string, MetaAdapterErrorPage<unknown, unknown, unknown>> = {}

  const { views } = await import(buildPath('tmp/viewsIndex.mjs'))
  const viewsPattern = relative(
    buildPath('tmp'),
    basePath(context.blueprint.get('stone.builder.input.views', 'app/**/*.{tsx,jsx,mjsx}'))
  )

  for (const [path, view] of Object.entries<Record<string, ClassType>>(views)) {
    for (const [key, module] of Object.entries(view)) {
      let result = {}
      type resultType = ReturnType<typeof generateDeclarativeLazyPages | typeof generateImperativeLazyPages>

      if (isDeclarative(context.blueprint, context.event)) {
        result = generateDeclarativeLazyPages(module, path, key)
      } else if (isStoneBlueprint<UseReactBlueprint>(module)) {
        result = generateImperativeLazyPages(module, path, key)
      }

      if (isNotEmpty<resultType>(result)) {
        definitions.push(...result.definitions)
        Object.assign(layouts, result.layouts)
        Object.assign(errorPages, result.errorPages)
        Object.assign(adapterErrorPages, result.adapterErrorPages)
      }
    }
  }

  const dynamicBlueprint = {
    stone: {
      router: {
        definitions
      },
      useReact: {
        layouts,
        errorPages,
        adapterErrorPages
      }
    }
  }
  // Expose the scanned page routes so the SSG step can derive its pre-render set
  // from them (zero-config): the same definitions that drive lazy loading also
  // decide what gets pre-rendered, so the user never restates the route list.
  context.blueprint.set('stone.builder.ssg.definitions', definitions)

  const replacePattern = /"(\(\) => modules\[[^)]+\]\(\)\.then\(v => v\.[^)]+\))"/g
  const pagesContent = `
  // @ts-ignore
  const modules = import.meta.glob('${viewsPattern}')
  export const dynamicBlueprint = ${JSON.stringify(dynamicBlueprint, null, 2).replace(replacePattern, '$1')};
  `

  outputFileSync(
    buildPath(isTypescriptApp(context.blueprint, context.event) ? 'tmp/pages.ts' : 'tmp/pages.mjs'),
    pagesContent,
    'utf-8'
  )

  return await next(context)
}

/**
 * Generates the client file for the application.
 *
 * @param context The console context.
 * @param next The next pipe function.
 * @returns The updated blueprint object.
 */
export const GenerateClientFileMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  const isLazy = isLazyViews(context.blueprint, context.event)
  const basePattern = basePath(!isLazy
    ? context.blueprint.get('stone.builder.input.all', 'app/**/*.**')
    : context.blueprint.get('stone.builder.input.app', 'app/**/*.{ts,js,mjs,json}'))
  const pattern = relative(buildPath('tmp'), basePattern)

  const isTypescript = isTypescriptApp(context.blueprint, context.event)
  const userFilename = isTypescript ? 'client.ts' : 'client.mjs'
  const filename = isTypescript ? 'tmp/index.ts' : 'tmp/index.mjs'

  let content = existsSync(basePath(userFilename))
    ? readFileSync(basePath(userFilename), 'utf-8')
    : reactClientEntryPointTemplate(pattern)

  // Add the lazy pages to the client file.
  content = !isLazy
    ? content.replace('%pattern%', pattern)
    : `import * as pages from './pages${isTypescript ? '' : '.mjs'}';\n`
      .concat(content)
      .replace('%pattern%', pattern)
      .replace('// %concat%', '.concat(Object.values(pages))')

  outputFileSync(buildPath(filename), content, 'utf-8')

  return await next(context)
}

/**
 * Generates a server file for all modules in the application.
 *
 * @param context The console context.
 * @param next The next pipe function.
 * @returns The updated blueprint object.
 */
export const GenerateReactServerFileMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  const pattern = relative(
    buildPath('tmp'),
    basePath(context.blueprint.get('stone.builder.input.all', 'app/**/*.**'))
  )
  const printUrls = context.blueprint.get('stone.builder.server.printUrls', true)

  const isTypescript = isTypescriptApp(context.blueprint, context.event)
  const userFilename = isTypescript ? 'server.ts' : 'server.mjs'
  const filename = isTypescript ? 'tmp/server.ts' : 'tmp/server.mjs'

  let content = existsSync(basePath(userFilename))
    ? readFileSync(basePath(userFilename), 'utf-8')
    : reactServerEntryPointTemplate(pattern, printUrls)

  content = content
    .replace('%pattern%', pattern)
    .replace("'%printUrls%'", String(printUrls))

  outputFileSync(
    buildPath('tmp/template.mjs'),
    `export const indexHtmlTemplate = \`${readFileSync(distPath('.stone/tmp/index.html'), 'utf-8')}\`;`,
    'utf-8'
  )

  content = `import { indexHtmlTemplate } from './template.mjs';\n ${content}`.replace(
    '// %blueprint%',
    'blueprint.setIf(\'stone.useReact.htmlTemplateContent\', indexHtmlTemplate);'
  )

  outputFileSync(buildPath(filename), content, 'utf-8')

  return await next(context)
}

/**
 * Generates an index HTML file for the application.
 *
 * @param context The console context.
 * @param next The next pipe function.
 * @returns The updated blueprint object.
 */
export const GenerateIndexHtmlFileMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  const jsEntryPoint = isTypescriptApp(context.blueprint, context.event) ? 'index.ts' : 'index.mjs'
  const cssEntryPoint = context.blueprint.get('stone.builder.input.mainCSS', '/assets/css/index.css')

  const mainjs = `<script type="module" src="${jsEntryPoint}"></script>`
  const mainCSS = `<link rel="stylesheet" href="${basePath(cssEntryPoint)}" />`

  let content = existsSync(basePath('index.html'))
    ? readFileSync(basePath('index.html'), 'utf-8')
    : reactHtmlEntryPointTemplate(mainjs, mainCSS)

  content = content
    .replace('<!--main-js-->', mainjs)
    .replace('<!--main-css-->', mainCSS)

  outputFileSync(buildPath('tmp/index.html'), content, 'utf-8')

  return await next(context)
}

/**
 * Builds the client application using Vite.
 *
 * @param context The console context.
 * @param next The next pipe function.
 * @returns The updated blueprint object.
 */
export const BuildClientAppMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  context.commandOutput.info('Building client application...')
  const userConfig = await getViteConfig('build', 'production')
  const excludedModules = context.blueprint.get('stone.builder.browser.excludedModules', [])
  const customInput = {
    plugins: [
      removeImportsVitePlugin(excludedModules)
    ],
    build: {
      emptyOutDir: true,
      outDir: distPath(),
      rollupOptions: {
        input: buildPath('tmp/index.html')
      }
    }
  }
  const viteConfig = mergeConfig(userConfig, customInput)

  await build(viteConfig)

  return await next(context)
}

/**
 * Builds the server application using Vite.
 *
 * @param context The console context.
 * @param next The next pipe function.
 * @returns The updated blueprint object.
 */
export const BuildReactServerAppMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  console.info('Building server application...')
  const userConfig = await getViteConfig('build', 'production')
  const customInput = {
    build: {
      target: 'node20', // Override the browser target: SSR bundle runs on Node, TLA allowed.
      emptyOutDir: false,
      outDir: distPath(),
      ssr: buildPath(isTypescriptApp(context.blueprint, context.event) ? 'tmp/server.ts' : 'tmp/server.mjs'),
      rollupOptions: {
        output: {
          entryFileNames: 'server.mjs',
          chunkFileNames: 'assets/server-[name]-[hash].mjs'
        }
      }
    },
    ssr: {
      noExternal: true,
      external: undefined
    }
  }
  const viteConfig = mergeConfig(userConfig, customInput)

  await build(viteConfig)

  return await next(context)
}

/**
 * Build terminating middleware.
 *
 * @param context The console context.
 * @param next The next pipe function.
 * @returns The updated blueprint object.
 */
export const BuildReactCleaningMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  moveSync(distPath('.stone/tmp/index.html'), distPath('index.html'))

  removeSync(buildPath('tmp'))
  removeSync(distPath('.stone'))

  return await next(context)
}

/**
 * Generates the public environment files.
 *
 * @param context The console context.
 * @param next The next pipe function.
 * @returns The updated blueprint object.
 */
export const GeneratePublicEnvFileMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  const content = readFileSync(distPath('index.html'), 'utf-8')
  const hasEnvFile = generatePublicEnvironmentsFile(
    context.blueprint,
    distPath('env')
  )

  outputFileSync(
    distPath('index.html'),
    content.replace(
      '<!--env-js-->',
      hasEnvFile ? '<script src="/env/environments.js"></script>' : ''
    ),
    'utf-8'
  )

  return await next(context)
}

/**
 * Middleware for building CSR React applications.
 */
export const ReactCSRBuildMiddleware: Array<MetaPipe<ConsoleContext, IBlueprint>> = [
  { module: GenerateViewsIndexMiddleware, priority: 0 },
  { module: BuildViewsMiddleware, priority: 1 },
  { module: GenerateLazyPageMiddleware, priority: 2 },
  { module: GenerateClientFileMiddleware, priority: 3 },
  { module: GenerateIndexHtmlFileMiddleware, priority: 4 },
  { module: BuildClientAppMiddleware, priority: 5 },
  { module: BuildReactCleaningMiddleware, priority: 6 },
  { module: GeneratePublicEnvFileMiddleware, priority: 7 }
]

/**
 * Middleware for building SSR React applications.
 */
export const ReactSSRBuildMiddleware: Array<MetaPipe<ConsoleContext, IBlueprint>> = [
  { module: GenerateViewsIndexMiddleware, priority: 0 },
  { module: BuildViewsMiddleware, priority: 1 },
  { module: GenerateLazyPageMiddleware, priority: 2 },
  { module: GenerateClientFileMiddleware, priority: 3 },
  { module: GenerateIndexHtmlFileMiddleware, priority: 4 },
  { module: BuildClientAppMiddleware, priority: 5 },
  { module: GenerateReactServerFileMiddleware, priority: 6 },
  { module: BuildReactServerAppMiddleware, priority: 7 },
  { module: BuildReactCleaningMiddleware, priority: 8 },
  { module: GeneratePublicEnvFileMiddleware, priority: 9 }
]

/**
 * Wait for the spawned SSR server to be ready and return its base URL.
 *
 * Parses the server's stdout for a `localhost:<port>` (or any `host:port`) banner line.
 * Falls back to the configured adapter port after a short delay.
 *
 * @param child - The spawned server process.
 * @param fallbackUrl - The URL to assume if no banner is detected.
 * @returns The base URL to crawl.
 */
async function waitForServer (child: ChildProcess, fallbackUrl: string, timeoutMs = 8000): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    let settled = false
    let stderr = ''

    const cleanup = (): void => {
      clearTimeout(timer)
      child.stdout?.off('data', onData)
      child.stderr?.off('data', onStderr)
      child.off('exit', onExit)
    }
    const done = (url: string): void => { if (!settled) { settled = true; cleanup(); resolve(url) } }
    const fail = (error: Error): void => { if (!settled) { settled = true; cleanup(); reject(error) } }

    const onData = (chunk: Buffer): void => {
      const match = /https?:\/\/[^\s]*?:(\d+)/.exec(chunk.toString())
      if (match !== null) {
        // Crawl the SAME host the app is configured to bind (from fallbackUrl), with the port the
        // server actually announced. Forcing 127.0.0.1 while the server bound `localhost` (which is
        // ::1 on IPv6-first Linux CI) is what made SSG "fetch failed" there.
        const url = new URL(fallbackUrl)
        url.port = match[1]
        done(url.origin)
      }
    }
    const onStderr = (chunk: Buffer): void => { stderr += chunk.toString(); onData(chunk) }
    // If the server exits before ever announcing a URL, it has no HTTP endpoint to crawl:
    // fail fast with a clear message instead of waiting out the timeout and hitting ECONNREFUSED.
    const onExit = (code: number | null): void => {
      fail(new CliError(
        'SSG requires an HTTP server adapter (e.g. @stone-js/node-http-adapter): the built server ' +
        `exited (code ${code ?? 'null'}) without exposing an HTTP endpoint.${stderr.length > 0 ? `\n${stderr.trim()}` : ''}`
      ))
    }

    const timer = setTimeout(() => done(fallbackUrl), timeoutMs)
    child.stdout?.on('data', onData)
    child.stderr?.on('data', onStderr)
    child.on('exit', onExit)
  })
}

/**
 * Pre-render routes to static HTML (SSG).
 *
 * SSG is SSR executed at build time: this starts the freshly-built SSR server, crawls the
 * routes, writes each response to `dist/<route>/index.html` via the SSG orchestrator, then
 * stops the server. Pages render identically whether pre-rendered or server-rendered.
 *
 * The route set is zero-config: it is derived from the app's own scanned page routes
 * (`stone.builder.ssg.definitions`). Anything the user lists in `stone.builder.ssg.routes`
 * is merged in as an additive escape hatch (e.g. expanded parameterized routes, extras),
 * never a replacement. If nothing is known, it falls back to the root.
 *
 * @param context - The console context.
 * @param next - The next middleware.
 * @returns The blueprint.
 */
export const GenerateStaticSiteMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  const output = context.blueprint.get<string>('stone.builder.output', 'server.mjs')
  const definitions = context.blueprint.get<RouteDefinitionLike[]>('stone.builder.ssg.definitions', [])
  const configured = context.blueprint.get<string[]>('stone.builder.ssg.routes', [])
  const adapterUrl = context.blueprint.get<string>('stone.adapter.url', 'http://localhost:8080')

  // Derived (auto) + configured (opt-in). Fall back to the root only when neither
  // the app nor the user named a single route to pre-render.
  const derived = collectStaticTargets(definitions)
  const extraTargets = configured.map((path) => ({ path }))
  if (derived.length === 0 && extraTargets.length === 0) extraTargets.push({ path: '/' })

  const child = spawn('node', [distPath(output)], { stdio: ['ignore', 'pipe', 'pipe'] })

  try {
    const baseUrl = await waitForServer(child, adapterUrl)

    const written = await runSsg({
      definitions,
      extraTargets,
      outDir: distPath(),
      render: async (target) => {
        try {
          const response = await fetch(new URL(target.path, baseUrl))
          return { path: target.path, html: await response.text(), statusCode: response.status }
        } catch (error: any) {
          throw new CliError(
            `SSG failed to reach the SSR server at ${baseUrl}${target.path}. SSG needs an HTTP ` +
            'server adapter (e.g. @stone-js/node-http-adapter) listening at that address.\n' +
            `Cause: ${String(error?.message ?? error)}`
          )
        }
      }
    })

    context.commandOutput.info(`Pre-rendered ${written.length} route(s) to static HTML.`)
  } finally {
    child.kill('SIGTERM')
  }

  return await next(context)
}

/**
 * Middleware for building SSG React applications (SSR build + static pre-render).
 */
export const ReactSSGBuildMiddleware: Array<MetaPipe<ConsoleContext, IBlueprint>> = [
  ...ReactSSRBuildMiddleware,
  { module: GenerateStaticSiteMiddleware, priority: 10 }
]
