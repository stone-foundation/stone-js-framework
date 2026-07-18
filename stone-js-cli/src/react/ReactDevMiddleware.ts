import {
  viteDevServerTemplate,
  reactHtmlEntryPointTemplate,
  reactConsoleEntryPointTemplate,
  reactClientEntryPointTemplate
} from './stubs'
import fsExtra from 'fs-extra'
import { relative } from 'node:path'
import { build, mergeConfig } from 'vite'
import { IBlueprint } from '@stone-js/core'
import { getViteConfig } from './react-utils'
import { ConsoleContext } from '../declarations'
import { MetaPipe, NextPipe } from '@stone-js/pipeline'
import { basePath, buildPath } from '@stone-js/filesystem'
import { generatePublicEnvironmentsFile, isTypescriptApp, setCache } from '../utils'

const { outputFileSync, existsSync, readFileSync } = fsExtra

/**
 * Generates an index file for all modules in the application.
 * This index file is used for SSR and in development mode.
 * Note: This entry point will be embedded in the index.html file.
 *
 * @param context The console context.
 * @param next The next pipe function.
 * @returns The updated blueprint object.
 */
export const GenerateEntryPointFileMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  const pattern = relative(
    buildPath(),
    basePath(context.blueprint.get('stone.builder.input.all', 'app/**/*.**'))
  )

  const isTypescript = isTypescriptApp(context.blueprint, context.event)

  const filename = isTypescript ? 'index.ts' : 'index.mjs'
  const userFilename = isTypescript ? 'client.ts' : 'client.mjs'

  let content = existsSync(basePath(userFilename))
    ? readFileSync(basePath(userFilename), 'utf-8')
    : reactClientEntryPointTemplate(pattern)

  content = content.replace('%pattern%', pattern)

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
export const GenerateDevHtmlTemplateFileMiddleware = async (
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

  outputFileSync(buildPath('index.html'), content, 'utf-8')

  return await next(context)
}

/**
 * Generates a development server for the application.
 *
 * @param context The console context.
 * @param next The next pipe function.
 * @returns The updated blueprint object.
 */
export const GenerateDevServerMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  outputFileSync(
    buildPath('server.mjs'),
    viteDevServerTemplate(),
    'utf-8'
  )
  return await next(context)
}

/**
 * Generates the public environment files.
 *
 * @param context The console context.
 * @param next The next pipe function.
 * @returns The updated blueprint object.
 */
export const GeneratePublicEnvFileDevMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  const content = readFileSync(buildPath('index.html'), 'utf-8')
  const hasEnvFile = generatePublicEnvironmentsFile(
    context.blueprint,
    buildPath()
  )

  outputFileSync(
    buildPath('index.html'),
    content.replace(
      '<!--env-js-->',
      hasEnvFile ? '<script src="environments.js"></script>' : ''
    ),
    'utf-8'
  )

  return await next(context)
}

/**
 * Generates console index file for all modules in the application.
 *
 * @param context The console context.
 * @param next The next pipe function.
 * @returns The updated blueprint object.
 */
export const GenerateReactConsoleFileMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  const pattern = relative(
    buildPath(),
    basePath(context.blueprint.get('stone.builder.input.all', 'app/**/*.**'))
  )

  const isTypescript = isTypescriptApp(context.blueprint, context.event)
  const userFilename = isTypescript ? 'console.ts' : 'console.mjs'
  const filename = isTypescript ? 'index.console.ts' : 'index.console.mjs'

  let content = existsSync(basePath(userFilename))
    ? readFileSync(basePath(userFilename), 'utf-8')
    : reactConsoleEntryPointTemplate(pattern)

  content = content.replace('%pattern%', pattern)

  outputFileSync(buildPath(filename), content, 'utf-8')

  outputFileSync(
    buildPath('template.mjs'),
    'export const template = ""',
    'utf-8'
  )

  return await next(context)
}

/**
 * Builds the console application using Vite.
 *
 * @param context The console context.
 * @param next The next pipe function.
 * @returns The updated blueprint object.
 */
export const BuildConsoleAppMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  const userConfig = await getViteConfig('build', 'production')
  const pattern = context.blueprint.get('stone.builder.input.all', 'app/**/*.**')
  const filename = isTypescriptApp(context.blueprint, context.event) ? 'index.console.ts' : 'index.console.mjs'
  const customInput = {
    build: {
      target: 'node20', // Override the browser target: SSR bundle runs on Node, TLA allowed.
      ssr: buildPath(filename),
      emptyOutDir: false,
      outDir: buildPath(),
      rollupOptions: {
        output: {
          entryFileNames: 'console.mjs',
          chunkFileNames: 'console-[name].mjs'
        }
      }
    }
  }
  const viteConfig = mergeConfig(userConfig, customInput)

  await build(viteConfig)

  setCache(pattern)

  return await next(context)
}

/**
 * Middleware for building React applications.
 */
export const ReactDevMiddleware: Array<MetaPipe<ConsoleContext, IBlueprint>> = [
  { module: GenerateEntryPointFileMiddleware, priority: 0 },
  { module: GenerateDevHtmlTemplateFileMiddleware, priority: 1 },
  { module: GeneratePublicEnvFileDevMiddleware, priority: 2 },
  { module: GenerateDevServerMiddleware, priority: 3 }
]

/**
 * Middleware for building server applications.
 */
export const ReactConsoleMiddleware: Array<MetaPipe<ConsoleContext, IBlueprint>> = [
  { module: GenerateReactConsoleFileMiddleware, priority: 0 },
  { module: BuildConsoleAppMiddleware, priority: 2 }
]
