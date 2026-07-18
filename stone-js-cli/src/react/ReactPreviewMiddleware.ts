import fsExtra from 'fs-extra'
import { IBlueprint } from '@stone-js/core'
import { viteDevServerTemplate } from './stubs'
import { buildPath } from '@stone-js/filesystem'
import { ConsoleContext } from '../declarations'
import { MetaPipe, NextPipe } from '@stone-js/pipeline'

const { outputFileSync } = fsExtra

/**
 * Generates a preview server for the application.
 *
 * @param context The console context.
 * @param next The next pipe function.
 * @returns The updated blueprint object.
 */
export const GeneratePreviewServerMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  outputFileSync(
    buildPath('preview.mjs'),
    viteDevServerTemplate('runPreviewServer'),
    'utf-8'
  )
  return await next(context)
}

/**
 * Middleware for building React applications.
 */
export const ReactPreviewMiddleware: Array<MetaPipe<ConsoleContext, IBlueprint>> = [
  { module: GeneratePreviewServerMiddleware, priority: 0 }
]
