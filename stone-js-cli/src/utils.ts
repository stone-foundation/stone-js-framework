import fsExtra from 'fs-extra'
import deepmerge from 'deepmerge'
import process from 'node:process'
import { glob, globSync } from 'glob'
import { readFileSync } from 'node:fs'
import { createHash } from 'node:crypto'
import { fileURLToPath } from 'node:url'
import DotenvExpand from 'dotenv-expand'
import { ChildProcess } from 'node:child_process'
import { basename, dirname, join } from 'node:path'
import Dotenv, { DotenvPopulateInput } from 'dotenv'
import { builder, BuilderConfig } from './options/BuilderConfig'
import { IBlueprint, IncomingEvent, isNotEmpty } from '@stone-js/core'
import { basePath, buildPath, importModule } from '@stone-js/filesystem'
import { DotenvConfig, DotenvFiles, DotenvOptions } from './options/DotenvConfig'

const { readJsonSync, pathExistsSync, outputJsonSync, outputFileSync } = fsExtra

/**
 * Resolve path from file directory.
 *
 * @param   {...string} paths
 * @returns {string}
 */
export function dirPath (...paths: string[]): string {
  return join(dirname(fileURLToPath(import.meta.url)), ...paths)
}

/**
 * Get File Hash.
 * Creates a file hash for caching purposes.
 *
 * @param filename - The path to the file.
 * @returns The SHA-256 hash of the file content.
 */
export function getFileHash (filename: string): string {
  return createHash('sha256').update(readFileSync(filename)).digest('hex')
}

/**
 * Get cache.
 * Application files' cache memory.
 *
 * @returns The cache object.
 */
export function getCache (): Record<string, string> {
  return pathExistsSync(buildPath('.cache'))
    ? (readJsonSync(buildPath('.cache'), { throws: false }) ?? {})
    : {}
}

/**
 * Set cache.
 * Stores application files' hash in the cache.
 *
 * @param pattern - The glob pattern to match files.
 */
export function setCache (pattern: string): void {
  const cache = getCache()

  globSync(basePath(pattern)).forEach((filePath) => {
    cache[filePath] = getFileHash(filePath)
  })

  outputJsonSync(buildPath('.cache'), cache)
}

/**
 * Should build application.
 * Determines whether the application should be rebuilt.
 *
 * @param pattern - The glob pattern to match files.
 * @returns True if the application should be rebuilt; otherwise, false.
 */
export function shouldBuild (pattern: string): boolean {
  const cache = getCache()

  return globSync(basePath(pattern)).some((filePath, _, paths) => {
    return !Object.keys(cache).every(v => paths.includes(v)) || cache[filePath] === undefined || cache[filePath] !== getFileHash(filePath)
  })
}

/**
 * Get the env variables in .env file using the Dotenv package.
 *
 * @param options - The options for loading environment variables.
 * @returns The parsed environment variables.
 */
export function getEnvVariables (options: Partial<DotenvOptions>): Record<string, string> | undefined {
  const processEnv = (options.ignoreProcessEnv === true ? {} : process.env) as DotenvPopulateInput
  const output = Dotenv.config({ ...options, processEnv })

  if (options.expand === true) {
    return DotenvExpand.expand({ ...output, processEnv }).parsed
  }

  return output.parsed
}

/**
 * Get the public env options.
 *
 * @returns The public environment options.
 */
export function getDefaultPublicEnvOptions (): Record<string, DotenvFiles> {
  return glob.sync(
    [basePath('.env.public'), basePath('.env.public.*')]
  ).reduce((prev, file) => {
    const name = basename(file).replace(/\.env\.public\.?/, '').trim()
    const env = name.length > 0 ? name : 'default'

    return {
      ...prev,
      [env]: {
        path: file,
        override: false,
        default: env === 'default'
      }
    }
  }, {})
}

/**
 * Generates environment files for the browser environment.
 *
 * @param blueprint - The blueprint object.
 * @param baseOutputPath - The base output path.
 * @returns True if the environment files were generated; otherwise, false.
 */
export function generatePublicEnvironmentsFile (blueprint: IBlueprint, baseOutputPath: string): boolean {
  let generated: boolean = false

  const dotenv = blueprint.get<DotenvConfig>('stone.builder.dotenv', {})
  const options = dotenv.options ?? {}

  Object.entries(dotenv.public ?? getDefaultPublicEnvOptions()).forEach(([env, value]) => {
    options.ignoreProcessEnv = true
    options.path = value.path ?? '.env.public'
    options.override = value.override ?? options.override ?? false

    const content = `window.process = window.process || {}
window.process.env = {
  ...window.process.env,
  ...JSON.parse('${JSON.stringify(getEnvVariables(options) ?? {})}')
}`

    outputFileSync(join(baseOutputPath, `environments.${env}.js`), content, 'utf-8')

    if (value.default === true) {
      generated = true
      outputFileSync(join(baseOutputPath, 'environments.js'), content, 'utf-8')
    }
  })

  return generated
}

/**
 * Setup process signal handlers that terminate the current child process on shutdown.
 *
 * Accepts a **getter** rather than a process value: the child is usually spawned after this is
 * wired (in a command constructor), so capturing the value here would capture `undefined` and
 * never kill the real child (leaving orphaned servers on Ctrl+C). The getter is read at signal
 * time, so it always sees the current child.
 *
 * @param getServerProcess - Returns the child process to terminate (or undefined if none yet).
 */
export function setupProcessSignalHandlers (getServerProcess: () => ChildProcess | undefined): void {
  const terminate = (): void => {
    getServerProcess()?.kill('SIGTERM') // Gracefully terminate the current child process
  }

  process
    .on('exit', terminate)
    .on('SIGINT', terminate)
    .on('SIGTERM', terminate)
}

/**
 * Define user configuration.
 *
 * @param config - The user configuration.
 * @returns The user configuration.
 */
export const defineConfig = (config: Partial<BuilderConfig>): Partial<BuilderConfig> => config

/**
 * Get the Stone.js builder configuration.
 *
 * @returns The Stone.js builder configuration.
 */
export const getStoneBuilderConfig = async (): Promise<BuilderConfig> => {
  const configPaths = ['./stone.config.mjs', './stone.config.js']

  for (const path of configPaths) {
    const module = await importModule<Record<string, BuilderConfig>>(path)
    const config = Object.values(module ?? {}).shift()
    if (isNotEmpty<BuilderConfig>(config)) {
      return deepmerge<BuilderConfig>(builder, config)
    }
  }

  return builder
}

/**
 * Determines if the application is using TypeScript.
 *
 * @param blueprint The blueprint object.
 * @param event The incoming event.
 * @returns True if the application is using TypeScript.
 */
export const isTypescriptApp = (blueprint: IBlueprint, event: IncomingEvent): boolean => {
  const files = glob.sync(basePath(blueprint.get('stone.builder.input.all', 'app/**/*.{tsx,ts}')))
  if (!event.is('language', undefined)) return event.is('language', 'typescript')
  if (!blueprint.is('stone.builder.language', undefined)) return blueprint.is('stone.builder.language', 'typescript')
  return files.length > 0
}

/**
 * Determines if the application is using React.
 *
 * @param blueprint The blueprint object.
 * @param event The incoming event.
 * @returns True if the application is using React.
 */
export const isReactApp = (blueprint: IBlueprint, event: IncomingEvent): boolean => {
  const files = glob.sync(basePath(blueprint.get('stone.builder.input.views', 'app/**/*.{tsx,jsx,mjsx}')))
  if (!event.is('target', undefined)) return event.is('target', 'react')
  if (!blueprint.is('stone.builder.target', undefined)) return blueprint.is('stone.builder.target', 'react')
  return files.length > 0
}

/**
 * Determines if the application is using lazy loading.
 *
 * @param blueprint The blueprint object.
 * @param event The incoming event.
 * @returns True if the application is using lazy loading.
 */
export const isLazyViews = (blueprint: IBlueprint, event: IncomingEvent): boolean => {
  const files = glob.sync(basePath(blueprint.get('stone.builder.input.all', 'app/**/*.{ts,tsx,js,jsx,mjsx}')))
  if (!event.is('lazy', undefined)) return event.is('lazy', true)
  if (!blueprint.is('stone.builder.lazy', undefined)) return blueprint.is('stone.builder.lazy', true)
  return files.some((filePath) => {
    const content = readFileSync(filePath, 'utf-8')
    return content.includes('@stone-js/router') && (content.includes('@Routing') || content.includes('routerBlueprint'))
  })
}

/**
 * Determines if the application is using declarative API.
 *
 * @param blueprint The blueprint object.
 * @param event The incoming event.
 * @returns True if the application is using imperative API.
 */
export const isDeclarative = (blueprint: IBlueprint, event: IncomingEvent): boolean => {
  const files = glob.sync(basePath(blueprint.get('stone.builder.input.all', 'app/**/*.{ts,tsx,js,jsx,mjsx}')))
  if (!event.is('imperative', undefined)) return event.is('imperative', false)
  if (!blueprint.is('stone.builder.imperative', undefined)) return blueprint.is('stone.builder.imperative', false)
  return files.some((filePath) => {
    const content = readFileSync(filePath, 'utf-8')
    return content.includes('@stone-js/core') && content.includes('@StoneApp')
  })
}

/**
 * Determines if the application is using client-side rendering.
 *
 * @param blueprint The blueprint object.
 * @param event The incoming event.
 * @returns True if the application is using client-side rendering.
 */
export const isCSR = (blueprint: IBlueprint, event: IncomingEvent): boolean => {
  const files = glob.sync(basePath(blueprint.get('stone.builder.input.all', 'app/**/*.{ts,tsx,js,jsx,mjsx}')))
  if (!event.is('rendering', undefined)) return event.is('rendering', 'csr')
  if (!blueprint.is('stone.builder.rendering', undefined)) return blueprint.is('stone.builder.rendering', 'csr')
  return files.some((filePath) => {
    return inferRenderingStrategy(readFileSync(filePath, 'utf-8')) === 'csr'
  })
}

/**
 * Determines if the application is using server-side rendering.
 *
 * @param blueprint The blueprint object.
 * @param event The incoming event.
 * @returns True if the application is using server-side rendering.
 */
export const isSSR = (blueprint: IBlueprint, event: IncomingEvent): boolean => {
  const files = glob.sync(basePath(blueprint.get('stone.builder.input.all', 'app/**/*.{ts,tsx,js,jsx,mjsx}')))
  if (!event.is('rendering', undefined)) return event.is('rendering', 'ssr')
  if (!blueprint.is('stone.builder.rendering', undefined)) return blueprint.is('stone.builder.rendering', 'ssr')
  return files.some((filePath) => {
    return inferRenderingStrategy(readFileSync(filePath, 'utf-8')) === 'ssr'
  })
}

/**
 * Determines if the application is using static site generation (SSG).
 *
 * SSG is opt-in via the `--ssg` flag or `stone.builder.rendering = 'ssg'`. It is never
 * inferred from file contents (it is a deliberate deployment choice).
 *
 * @param blueprint The blueprint object.
 * @param event The incoming event.
 * @returns True if the application is using static site generation.
 */
export const isSSG = (blueprint: IBlueprint, event: IncomingEvent): boolean => {
  if (event.get('ssg') === true) return true
  if (!event.is('rendering', undefined)) return event.is('rendering', 'ssg')
  return blueprint.is('stone.builder.rendering', 'ssg')
}

/**
 * Determines the rendering strategy based on the content of the file.
 *
 * @param content - The content of the file.
 * @returns The rendering strategy: 'csr' or 'ssr'.
 */
export function inferRenderingStrategy (content: string): 'csr' | 'ssr' | undefined {
  const hasBrowser = content.includes('@stone-js/browser-adapter')
  const allAdapters = content.match(/['"]@?[\w\-\\/]+-adapter['"]/ig)
  const hasNonBrowserAdapter = allAdapters?.some(v => !v.includes('@stone-js/browser-adapter'))

  if (hasBrowser && hasNonBrowserAdapter === true) return 'ssr'
  if (hasBrowser && hasNonBrowserAdapter !== true) return 'csr'
}
