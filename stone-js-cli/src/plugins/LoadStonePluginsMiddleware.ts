import { StoneCliPlugin } from './declarations'
import { MetaPipe, NextPipe, Pipeline } from '@stone-js/pipeline'
import { collectStonePlugins, LoadedStonePlugin } from './loadPlugins'
import { BlueprintContext, ClassType, IBlueprint } from '@stone-js/core'

/**
 * Config-phase middleware that collects and wires the CLI plugins.
 *
 * Runs inside the CLI's blueprint pipeline, after the user config is loaded, so it can read
 * `stone.builder.plugins` (explicit, Path A) and, unless `stone.builder.autoDiscoverPlugins` is
 * `false`, auto-discover `@stone-js/*` first-party plugins (Path B). It then runs every plugin's
 * `blueprintMiddleware` on the same blueprint context (so plugins can augment `stone.builder.*`
 * before the builders run) and stashes the resolved plugin list on the blueprint for the build
 * phase (`stone.builder.loadedPlugins`).
 *
 * @param context - The blueprint context.
 * @param next - The next pipe.
 * @returns The blueprint.
 */
export const LoadStonePluginsMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextPipe<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  const configPlugins = context.blueprint.get<StoneCliPlugin[]>('stone.builder.plugins', [])
  const autoDiscover = context.blueprint.get<boolean>('stone.builder.autoDiscoverPlugins', true)

  const loaded = await collectStonePlugins(configPlugins, autoDiscover)

  const middleware = loaded.flatMap<MetaPipe<BlueprintContext<IBlueprint, ClassType>, IBlueprint>>(
    ({ plugin }) => plugin.blueprintMiddleware ?? []
  )

  if (middleware.length > 0) {
    await Pipeline
      .create<BlueprintContext<IBlueprint, ClassType>, IBlueprint>()
      .send(context)
      .through(...middleware)
      .then((ctx) => ctx.blueprint)
  }

  context.blueprint.set<LoadedStonePlugin[]>('stone.builder.loadedPlugins', loaded)

  return await next(context)
}
