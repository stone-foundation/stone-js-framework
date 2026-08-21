import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { NativeBuilder } from './NativeBuilder'
import type { StoneBuilderDefinition, StoneCliPlugin } from '@stone-js/cli'
import type { BlueprintContext, ClassType, IBlueprint, NextMiddleware } from '@stone-js/core'

/**
 * The name of the build target.
 */
export const NATIVE_TARGET: string = 'native'

/**
 * Whether this project is a native application.
 *
 * Answered by the presence of Expo's own manifest, because that is the file that makes a project
 * a native one, and because a Stone.js native application has React Native as a direct dependency
 * by definition, which makes any check on our own packages a weaker version of the same question.
 *
 * @param projectRoot - The project root.
 * @returns True when the project is a native application.
 */
export function isNativeApp (projectRoot: string = process.cwd()): boolean {
  return ['app.json', 'app.config.js', 'app.config.ts', 'app.config.mjs']
    .some((file) => existsSync(join(projectRoot, file)))
}

/**
 * The native build target.
 *
 * Its priority puts it ahead of the React target on purpose: a native application also has views
 * under `app/`, so the React target's detection would answer for it, and the more specific
 * question has to be asked first.
 *
 * `devMode` is `self-hosted` and `devEntry` is absent, which together say that Expo's own process
 * is the dev server: the CLI starts it and steps out of the way rather than supervising a child
 * of its own.
 */
export const nativeBuilderDefinition: StoneBuilderDefinition = {
  target: NATIVE_TARGET,
  priority: 5,
  devMode: 'self-hosted',
  match: () => isNativeApp(),
  resolver: (context) => new NativeBuilder(context)
}

/**
 * Register the native target on the build blueprint.
 *
 * A config-phase middleware, so the target exists before any command runs, and additive, so a
 * project that declared its own targets keeps them.
 *
 * @param context - The configuration context.
 * @param next - The next pipeline function.
 * @returns The updated blueprint.
 */
export const SetNativeBuilderMiddleware = async (
  context: BlueprintContext<IBlueprint, ClassType>,
  next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
): Promise<IBlueprint> => {
  context.blueprint.set(`stone.builder.builders.${NATIVE_TARGET}`, nativeBuilderDefinition)

  return await next(context)
}

/**
 * The React Native CLI plugin: `stone dev native` and `stone build native`.
 *
 * The module owns its own build, which is what the CLI's registered targets are for. There is
 * little to own here, since Expo and Metro do the bundling, but the one thing the CLI can give a
 * native application is the thing Expo cannot: its modules, collected rather than listed.
 *
 * Auto-discovered from this package's `stone.cliPlugin` entry, so a native project gets the
 * target by installing the renderer and nothing else.
 *
 * @returns The Stone CLI plugin.
 */
export function reactNativeCliPlugin (): StoneCliPlugin {
  return {
    name: '@stone-js/use-react-native',
    description: 'Adds the native build target: collects your modules, then hands the build to Expo.',
    blueprintMiddleware: [{ module: SetNativeBuilderMiddleware, priority: 4 }]
  }
}

/**
 * A ready-to-use plugin instance, read by first-party auto-discovery.
 */
const plugin: StoneCliPlugin = reactNativeCliPlugin()
export default plugin
