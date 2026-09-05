import fsExtra from 'fs-extra'
import { IBlueprint } from '@stone-js/core'
import { NextPipe } from '@stone-js/pipeline'
import { buildPath } from '@stone-js/filesystem'
import { LoadedStonePlugin } from './loadPlugins'
import { StoneReporter } from '../StoneReporter'
import { ConsoleContext } from '../declarations'
import { PluginContributions, createStonePluginContext } from './StonePluginContext'

const { emptyDirSync } = fsExtra

/**
 * Where a plugin writes what it generates, by convention.
 *
 * Kept private: a plugin author writes the path themselves, `plugins/x.mjs`, and a second public
 * name for one word would be one more thing frozen at the API freeze for nothing.
 */
const PLUGINS_DIR = 'plugins'

/**
 * The build-phase hooks a plugin can expose, run at distinct moments of the lifecycle.
 */
type PluginHook = 'onPrepare' | 'onBundle'

/**
 * Read a blueprint value as a string array, tolerating whatever a blueprint might return.
 *
 * @param value - The raw blueprint value.
 * @returns The value when it is an array, otherwise an empty array.
 */
function asStringArray (value: unknown): string[] {
  return Array.isArray(value) ? value : []
}

/**
 * Run one lifecycle hook across every loaded plugin, once.
 *
 * Contributions accumulate on the blueprint (`stone.builder.pluginModules` / `pluginBlueprints`),
 * seeded from what earlier phases already stashed, so the phases compose in priority order
 * (prepare → bundle → entry generation) without clobbering one another.
 *
 * @param context - The CLI build context.
 * @param hook - The hook to run (`onPrepare` or `onBundle`).
 * @param announce - Whether to announce auto-discovered plugins (only the prepare phase does).
 */
async function runPluginHook (context: ConsoleContext, hook: PluginHook, announce: boolean): Promise<void> {
  const loaded = context.blueprint.get<LoadedStonePlugin[]>('stone.builder.loadedPlugins', [])

  if (loaded.length === 0) { return }

  const command = context.event.getMetadataValue<string>('_task') ?? 'build'
  const reporter = StoneReporter.create(context.commandOutput)
  const contributions: PluginContributions = {
    modules: asStringArray(context.blueprint.get('stone.builder.pluginModules', [])),
    blueprints: asStringArray(context.blueprint.get('stone.builder.pluginBlueprints', []))
  }
  const pluginContext = createStonePluginContext(context, command, reporter, contributions)

  for (const { plugin, source } of loaded) {
    if (announce && source !== 'config') {
      reporter.step(`plugin ${plugin.name} (auto-discovered from ${source})`)
    }
    await plugin[hook]?.(pluginContext)
  }

  context.blueprint.set('stone.builder.pluginModules', contributions.modules)
  context.blueprint.set('stone.builder.pluginBlueprints', contributions.blueprints)
}

/**
 * Codegen-phase middleware: runs every plugin's `onPrepare` hook.
 *
 * Prepended to every builder pipeline (build, dev, preview, console), because codegen is needed
 * wherever the app is assembled, dev included. It writes generated files and stashes the modules
 * and blueprint statements the entry generators weave into the built app. Auto-discovered plugins
 * are announced here, so a build never silently runs first-party build code the developer cannot see.
 *
 * @param context - The CLI build context.
 * @param next - The next pipe.
 * @returns The blueprint.
 */
export const RunStonePluginsPrepareMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  // Emptied at the START of the run, and never at the end. A generated module is imported by the
  // application, so a development server keeps loading it for the whole session: deleting it when
  // some build finished is what gave `ENOENT` from Vite's transform step, in the middle of a session
  // that was working a second earlier. Emptying here gives the other half of the guarantee, that a
  // module left by a plugin no longer installed is never served in place of nothing.
  //
  // Unconditional, before the plugins run and even when none are loaded, because a stale file
  // outliving the plugin that wrote it is exactly the case the emptying exists for.
  emptyDirSync(buildPath(PLUGINS_DIR))

  await runPluginHook(context, 'onPrepare', true)

  return await next(context)
}

/**
 * Bundle-phase middleware: runs every plugin's `onBundle` hook.
 *
 * Added only to the production build pipelines, never to dev/preview, because it must fire when the
 * app is actually bundled, not on every build task. It runs after {@link RunStonePluginsPrepareMiddleware}
 * and before the bundler, so a plugin can tune the bundler (e.g. mutate `stone.builder.rollup`/`vite`).
 *
 * @param context - The CLI build context.
 * @param next - The next pipe.
 * @returns The blueprint.
 */
export const RunStonePluginsBundleMiddleware = async (
  context: ConsoleContext,
  next: NextPipe<ConsoleContext, IBlueprint>
): Promise<IBlueprint> => {
  await runPluginHook(context, 'onBundle', false)
  return await next(context)
}
