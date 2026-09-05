import fsExtra from 'fs-extra'
import { buildPath } from '@stone-js/filesystem'
import { StoneReporter } from '../StoneReporter'
import { ConsoleContext } from '../declarations'
import { StonePluginContext } from './declarations'

const { outputFileSync } = fsExtra

/**
 * The mutable set of contributions gathered from every plugin during a build.
 *
 * Plugins never touch the entry templates directly: they push module specifiers and blueprint
 * statements here (through the {@link StonePluginContext}), and the entry generators weave the
 * accumulated contributions into the generated code once, at the right moment.
 */
export interface PluginContributions {
  /**
   * Import specifiers to add to the built app's `modules` (resolvable from `.stone/tmp`).
   */
  modules: string[]

  /**
   * Raw blueprint statements to inject into the generated entry's `configure` step.
   */
  blueprints: string[]
}

/**
 * Create an empty {@link PluginContributions} set.
 *
 * @returns A fresh contributions accumulator.
 */
export function createPluginContributions (): PluginContributions {
  return { modules: [], blueprints: [] }
}

/**
 * Build the stable {@link StonePluginContext} facade handed to a plugin's build hooks.
 *
 * The facade wraps the CLI's internal {@link ConsoleContext} and a shared {@link PluginContributions}
 * accumulator, exposing only the small, stable surface plugin authors depend on.
 *
 * @param context - The CLI build context.
 * @param command - The command driving the lifecycle (e.g. `build`, `dev`).
 * @param reporter - The branded reporter for user-facing output.
 * @param contributions - The shared accumulator every plugin writes into.
 * @returns The plugin context facade.
 */
export function createStonePluginContext (
  context: ConsoleContext,
  command: string,
  reporter: StoneReporter,
  contributions: PluginContributions
): StonePluginContext {
  return {
    command,
    reporter,
    event: context.event,
    blueprint: context.blueprint,
    buildPath: (...paths: string[]) => buildPath(...paths),
    writeFile: (relativePath: string, content: string) => {
      const absolute = buildPath(relativePath)
      outputFileSync(absolute, content, 'utf-8')
      return absolute
    },
    addModule: (specifier: string) => {
      if (!contributions.modules.includes(specifier)) {
        contributions.modules.push(specifier)
      }
    },
    addBlueprint: (statement: string) => {
      contributions.blueprints.push(statement)
    }
  }
}
