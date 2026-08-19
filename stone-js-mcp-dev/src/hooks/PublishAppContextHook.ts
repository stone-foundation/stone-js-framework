import { IBlueprint } from '@stone-js/core'
import { publishAppContext } from '../appContext'
import { McpDevOptions } from '../declarations'

/**
 * Publish the application's resolved configuration when it starts.
 *
 * Runs on `onStart`, which is where the adapter hands over the blueprint of the application that is
 * actually running — the right platform, the right environment, the configuration every module ended
 * up contributing. That is the one thing `stone mcp` cannot work out for itself, because it is a
 * console command and booting the app from there answers as the console platform.
 *
 * Off in production. An application's resolved configuration is not something to leave on a
 * production disk by default, and nothing there reads it. `stone.mcpDev.publishContext` overrides the
 * decision in either direction, for a staging box worth introspecting or a dev machine that must not.
 */
export const PublishAppContextHook = ({ blueprint }: { blueprint: IBlueprint }): void => {
  const options = blueprint.get<McpDevOptions>('stone.mcpDev', {})
  const isProduction = blueprint.get<string>('stone.env', 'production') === 'production'

  if (!(options.publishContext ?? !isProduction)) { return }

  try {
    publishAppContext(blueprint)
  } catch {
    // A read-only or missing working directory must never stop an application from starting: this
    // exists to help a developer, and helping is not worth breaking a boot over.
  }
}
