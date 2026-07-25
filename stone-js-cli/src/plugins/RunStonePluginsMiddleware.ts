import { IBlueprint } from '@stone-js/core'
import { NextPipe } from '@stone-js/pipeline'
import { LoadedStonePlugin } from './loadPlugins'
import { StoneReporter } from '../StoneReporter'
import { ConsoleContext } from '../declarations'
import { createPluginContributions, createStonePluginContext } from './StonePluginContext'

/**
 * Build-phase middleware that runs the collected plugins' lifecycle hooks.
 *
 * Prepended to every build/dev/preview pipeline (via each builder's pipeline runner), so plugins
 * participate wherever the app is assembled. It runs all `onPrepare` hooks (codegen), then all
 * `onBundle` hooks (bundler participation), sharing a single contributions accumulator, and stashes
 * the result on the blueprint (`stone.builder.pluginModules` / `pluginBlueprints`) where the entry
 * generators read it. Auto-discovered plugins are announced on every run, so a build never silently
 * executes first-party code the developer cannot see.
 *
 * @param context - The CLI build context.
 * @param next - The next pipe.
 * @returns The blueprint.
 */
export const RunStonePluginsMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  const loaded = context.blueprint.get<LoadedStonePlugin[]>('stone.builder.loadedPlugins', [])

  if (loaded.length > 0) {
    const command = context.event.getMetadataValue<string>('_task') ?? 'build'
    const reporter = StoneReporter.create(context.commandOutput)
    const contributions = createPluginContributions()
    const pluginContext = createStonePluginContext(context, command, reporter, contributions)

    for (const { plugin, source } of loaded) {
      if (source !== 'config') {
        reporter.step(`plugin ${plugin.name} (auto-discovered from ${source})`)
      }
      await plugin.onPrepare?.(pluginContext)
    }

    for (const { plugin } of loaded) {
      await plugin.onBundle?.(pluginContext)
    }

    context.blueprint.set('stone.builder.pluginModules', contributions.modules)
    context.blueprint.set('stone.builder.pluginBlueprints', contributions.blueprints)
  }

  return await next(context)
}
