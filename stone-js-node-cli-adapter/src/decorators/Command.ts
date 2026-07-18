import { CommandBuilder } from 'yargs'
import { COMMAND_KEY } from './constants'
import { ClassType, setClassMetadata } from '@stone-js/core'

/**
 * Command options.
 *
 * Represents the configuration options for a CLI command.
 */
export interface CommandOptions {

  /**
   * The unique name of the command.
   */
  name: string

  /**
   * Alias or aliases for the command, used for identification or access.
   * Can be a single alias or an array of aliases.
   */
  alias?: string | string[]

  /**
   * The arguments required or accepted by the command.
   * Can be a single argument or an array of arguments.
   */
  args?: string | string[]

  /**
   * The description of the command.
   */
  desc?: string

  /**
   * A map of additional options for the command, where the key is the option name
   * and the value is its description.
   */
  options?: Partial<CommandBuilder<{}>>
}

/**
 * Command decorator to mark a class as a command and automatically bind it to the container.
 *
 * This decorator is useful for marking classes that should be treated as commands by the Stone.js framework,
 * making them easily injectable and manageable by the command container.
 *
 * @param options - The configuration options for the command, including singleton and alias settings.
 * @returns A decorator function to set metadata on the target class.
 *
 * @example
 * ```typescript
 * @Command({ alias: 'MyCommand' })
 * class MyCommand {
 *   // Command class logic here.
 * }
 * ```
 */
export const Command = <T extends ClassType = ClassType>(options: Partial<CommandOptions> = {}): ClassDecorator => {
  return setClassMetadata<T>(COMMAND_KEY, { options, isClass: true })
}
