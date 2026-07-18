import fsExtra from 'fs-extra'
import { rollup } from 'rollup'
import { serverIndexFile } from './stubs'
import { IBlueprint } from '@stone-js/core'
import { ConsoleContext } from '../declarations'
import { getRollupConfig } from './server-utils'
import { existsSync, readFileSync } from 'node:fs'
import { MetaPipe, NextPipe } from '@stone-js/pipeline'
import { basePath, buildPath, distPath } from '@stone-js/filesystem'

const { outputFileSync, removeSync } = fsExtra

/**
 * Builds the server application using Rollup.
 *
 * @param context The console context.
 * @param next The next pipe function.
 * @returns The updated blueprint object.
 */
export const BuildServerAppMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  context.commandOutput.show(
    context.commandOutput.format.yellow('⚡ Building application...')
  )

  const rollupConfig = await getRollupConfig(context.blueprint)
  const pattern = context.blueprint.get(
    'stone.builder.input.all',
    'app/**/*.**'
  )

  rollupConfig.input = basePath(pattern)
  rollupConfig.output = {
    format: 'es',
    file: buildPath('tmp/modules.mjs')
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
export const GenerateServerFileMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  const printUrls = context.blueprint.get('stone.builder.server.printUrls', true)
  const content = existsSync(basePath('server.mjs'))
    ? readFileSync(basePath('server.mjs'), 'utf-8').replace("'%printUrls%'", String(printUrls))
    : serverIndexFile(printUrls)

  outputFileSync(buildPath('tmp/server.mjs'), content, 'utf-8')

  return await next(context)
}

/**
 * Bundles the server application using Rollup.
 *
 * @param context The console context.
 * @param next The next pipe function.
 * @returns The updated blueprint object.
 */
export const BundleServerAppMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  context.commandOutput.show(
    context.commandOutput.format.green('🚀 Bundling application...')
  )

  const output = context.blueprint.get('stone.builder.output', 'server.mjs')
  const rollupConfig = await getRollupConfig(context.blueprint, 'bundle')

  rollupConfig.input = buildPath('tmp/server.mjs')
  rollupConfig.output = {
    format: 'es',
    file: distPath(output)
  }

  const bundle = await rollup(rollupConfig)

  await bundle.write(rollupConfig.output)

  return await next(context)
}

/**
 * Build terminating middleware.
 *
 * @param context The console context.
 * @param next The next pipe function.
 * @returns The updated blueprint object.
 */
export const BuildTerminatingMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  removeSync(buildPath('tmp'))

  return await next(context)
}

/**
 * Middleware for building Server applications.
 */
export const ServerBuildMiddleware: Array<MetaPipe<ConsoleContext, IBlueprint>> = [
  { module: BuildServerAppMiddleware, priority: 0 },
  { module: GenerateServerFileMiddleware, priority: 1 },
  { module: BundleServerAppMiddleware, priority: 2 },
  { module: BuildTerminatingMiddleware, priority: 3 }
]
