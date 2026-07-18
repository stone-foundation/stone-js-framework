import fsExtra from 'fs-extra'
import { CliError } from './errors/CliError'
import { basePath } from '@stone-js/filesystem'
import { IncomingEvent, isNotEmpty } from '@stone-js/core'
import { initCommandOptions } from './commands/InitCommand'
import { previewCommandOptions } from './commands/PreviewCommand'

const { pathExistsSync, readJsonSync } = fsExtra

/**
 * Ensure that the current directory is a Stone project.
 *
 * @param event - The incoming event.
 */
export async function EnsureStoneProjectHook ({ event }: { event: IncomingEvent }): Promise<void> {
  const task = event.get<string>('_task') ?? ''
  const previewFilename = event.get<string>('filename')

  const { name: init, alias: initAlias = '' } = initCommandOptions
  const { name: preview, alias: prevAlias = '' } = previewCommandOptions
  const isStoneProject = (): boolean => {
    const dependencies = readJsonSync(basePath('package.json'), { throws: false })?.dependencies
    return dependencies?.['@stone-js/core'] !== undefined || pathExistsSync(basePath('stone.config.js')) || pathExistsSync(basePath('stone.config.mjs'))
  }

  if (
    ![init, initAlias].includes(task) &&
    !([preview, prevAlias].includes(task) && isNotEmpty(previewFilename)) &&
    !isStoneProject()
  ) {
    throw new CliError('This is not a Stone project. Please run this command in a Stone project directory.')
  }
}
