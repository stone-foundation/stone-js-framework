import { glob } from 'glob'
import { basePath, buildPath } from '@stone-js/filesystem'
import { ReactBuilder } from './ReactBuilder'
import type { StoneBuilderDefinition, StoneCliPlugin } from '@stone-js/cli'
import type { BlueprintContext, ClassType, IBlueprint, NextMiddleware } from '@stone-js/core'

export * from './ReactBuilder'
export * from './ReactBuildMiddleware'
export * from './ReactDevMiddleware'
export * from './ReactPreviewMiddleware'
export * from './RemoveImportsVitePlugin'
export * from './react-utils'
export * from './ssg'
export * from './stubs'
export * from './vite-config'

/**
 * The name of the build target.
 */
export const REACT_TARGET: string = 'react'

/**
 * Whether this project has views, which is what makes it a React application.
 *
 * Detection only. Whether a target was named on the command line or in the configuration is the
 * resolver's business, so this answers the one question it is asked.
 *
 * @param blueprint - The blueprint.
 * @returns True when the project has views.
 */
export function hasReactViews (blueprint: IBlueprint): boolean {
  return glob.sync(basePath(blueprint.get('stone.builder.input.views', 'app/**/*.{tsx,jsx,mjsx}'))).length > 0
}

/**
 * The React build target.
 *
 * `devMode` is `self-hosted` because Vite owns hot module replacement: the CLI launches the
 * generated dev server and follows its exit code rather than restarting it on every change.
 */
export const reactBuilderDefinition: StoneBuilderDefinition = {
  target: REACT_TARGET,
  priority: 10,
  devMode: 'self-hosted',
  devEntry: () => buildPath('server.mjs'),
  previewEntry: () => buildPath('preview.mjs'),
  match: (blueprint) => hasReactViews(blueprint),
  resolver: (context) => new ReactBuilder(context)
}

/**
 * Register the React target on the build blueprint.
 *
 * A config-phase middleware, so the target exists before any command runs, and additive, so a
 * project that declared its own targets keeps them.
 *
 * @param context - The configuration context.
 * @param next - The next pipeline function.
 * @returns The updated blueprint.
 */
export const SetReactBuilderMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  context.blueprint.set(`stone.builder.builders.${REACT_TARGET}`, reactBuilderDefinition)

  return await next(context)
}

/**
 * The React CLI plugin: how a React application is built.
 *
 * This used to live inside the CLI, which meant the CLI knew how to build a React application, and
 * carried Vite to prove it. It knows neither now. A project that renders nothing installs no
 * bundler, and this package owns the one question it is qualified to answer: how its own views
 * become an application.
 *
 * Auto-discovered from this package's `stone.cliPlugin` entry, so a React project keeps getting
 * `stone dev`, `stone build`, `stone preview` and the rest by installing the renderer and nothing
 * else.
 *
 * @returns The Stone CLI plugin.
 */
export function reactCliPlugin (): StoneCliPlugin {
  return {
    name: '@stone-js/use-react',
    description: 'Adds the React build target: CSR, SSR and SSG, bundled with Vite.',
    blueprintMiddleware: [{ module: SetReactBuilderMiddleware, priority: 4 }]
  }
}

/**
 * A ready-to-use plugin instance, read by first-party auto-discovery.
 */
const plugin: StoneCliPlugin = reactCliPlugin()
export default plugin
