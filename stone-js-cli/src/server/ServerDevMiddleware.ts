import fsExtra from 'fs-extra'
import { rollup } from 'rollup'
import { setCache } from '../utils'
import { IBlueprint } from '@stone-js/core'
import { ConsoleContext } from '../declarations'
import { getRollupConfig } from './server-utils'
import { existsSync, readFileSync } from 'node:fs'
import { MetaPipe, NextPipe } from '@stone-js/pipeline'
import { basePath, buildPath } from '@stone-js/filesystem'
import { consoleIndexFile, serverIndexFile } from './stubs'
import { applyPluginInjections } from '../plugins/applyPluginInjections'

const { outputFileSync } = fsExtra

/**
 * Builds the server application using Rollup.
 *
 * @param context The console context.
 * @param next The next pipe function.
 * @returns The updated blueprint object.
 */
export const BuildDevServerAppMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  const rollupConfig = await getRollupConfig(context.blueprint)
  const pattern = context.blueprint.get(
    'stone.builder.input.all',
    'app/**/*.**'
  )

  rollupConfig.input = basePath(pattern)
  rollupConfig.output = {
    format: 'es',
    file: buildPath('modules.mjs')
  }

  const builder = await rollup(rollupConfig)

  await builder.write(rollupConfig.output)

  return await next(context)
}

/**
 * Generates a server file.
 *
 * @param context The console context.
 * @param next The next pipe function.
 * @returns The updated blueprint object.
 */
export const GenerateDevServerFileMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  const printUrls = context.blueprint.get('stone.builder.server.printUrls', false)
  const raw = existsSync(basePath('server.mjs'))
    ? readFileSync(basePath('server.mjs'), 'utf-8').replace("'%printUrls%'", String(printUrls))
    : serverIndexFile(printUrls)
  const content = applyPluginInjections(raw, context.blueprint, buildPath())

  outputFileSync(buildPath('server.mjs'), content, 'utf-8')

  return await next(context)
}

/**
 * Generates a console file.
 *
 * @param context The console context.
 * @param next The next pipe function.
 * @returns The updated blueprint object.
 */
export const GenerateConsoleFileMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  const pattern = context.blueprint.get(
    'stone.builder.input.all',
    'app/**/*.**'
  )
  const raw = existsSync(basePath('console.mjs'))
    ? readFileSync(basePath('console.mjs'), 'utf-8')
    : consoleIndexFile()
  const content = applyPluginInjections(raw, context.blueprint, buildPath())

  setCache(pattern)
  outputFileSync(buildPath('console.mjs'), content, 'utf-8')

  return await next(context)
}

/**
 * Middleware for building server applications.
 */
export const ServerDevMiddleware: Array<MetaPipe<ConsoleContext, IBlueprint>> = [
  { module: BuildDevServerAppMiddleware, priority: 0 },
  { module: GenerateDevServerFileMiddleware, priority: 1 }
]

/**
 * Middleware for building server applications.
 */
export const ConsoleDevMiddleware: Array<MetaPipe<ConsoleContext, IBlueprint>> = [
  { module: BuildDevServerAppMiddleware, priority: 0 },
  { module: GenerateConsoleFileMiddleware, priority: 2 }
]
