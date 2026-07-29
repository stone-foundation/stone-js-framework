import { cliVersion } from './utils'
import { IBlueprint } from '@stone-js/core'
import { StoneReporter } from './StoneReporter'
import { CommandOutput } from '@stone-js/node-cli-adapter'

/**
 * Print the Stone.js signature banner once, before any command runs.
 *
 * The banner (the « Le Portail » logo + wordmark) is the CLI's signature: every command shows it,
 * exactly once. Registered on the `onExecutingEventHandler` lifecycle hook, which fires once per
 * command invocation; the container is injected, so `commandOutput` and `blueprint` are resolved
 * from it (same bindings the commands use).
 *
 * @param context - The injected container, destructured to its command output and blueprint.
 */
export function PrintBannerHook (
  { commandOutput, blueprint }: { commandOutput: CommandOutput, blueprint: IBlueprint }
): void {
  // The app's own version when it declares one (a built project), else the CLI's version. Nothing
  // sets `stone.builder.version` during `stone init`: there is no project to read a version from
  // yet, and the framework's version is the meaningful one there anyway (lockstep releases).
  const version = blueprint.get<string>('stone.builder.version', '') ?? ''
  StoneReporter.create(commandOutput, version.length > 0 ? version : cliVersion()).banner()
}
