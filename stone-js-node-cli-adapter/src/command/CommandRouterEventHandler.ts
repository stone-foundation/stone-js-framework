import {
  ICommandHandler,
  MetaCommandHandler,
  CommandHandlerClass,
  FactoryCommandHandler,
  FunctionalCommandHandler
} from '../declarations'
import {
  IContainer,
  IBlueprint,
  IEventHandler,
  IncomingEvent,
  isFunctionModule,
  OutgoingResponse,
  isMetaClassModule,
  isMetaFactoryModule,
  isMetaFunctionModule
} from '@stone-js/core'
import { COMMAND_NOT_FOUND_CODE } from '../constants'
import { CommandOptions } from '../decorators/Command'
import { NodeCliAdapterError } from '../errors/NodeCliAdapterError'

/**
 * CommandRouterEventHandlerOptions options.
 */
export interface CommandRouterEventHandlerOptions {
  container: IContainer
  blueprint: IBlueprint
}

/**
 * Class representing a CommandRouterEventHandler.
 * Responsible for finding and dispatching commands based on incoming events.
 *
 * @author
 * Mr. Stone <evensstone@gmail.com>
 */
export class CommandRouterEventHandler<
  W extends IncomingEvent = IncomingEvent,
  X = unknown
> implements IEventHandler<W, X> {
  /**
   * Blueprint configuration used to retrieve app settings.
   */
  private readonly blueprint: IBlueprint

  /**
   * The service container that manages dependencies.
   */
  private readonly container: IContainer

  /**
   * Creates a new instance of `CommandRouter`.
   *
   * This static method initializes a `CommandRouter` with the specified options.
   *
   * @typeParam W - The type of the incoming event (default: `IncomingEvent`).
   * @typeParam X - The type of the outgoing response (default: `OutgoingResponse`).
   *
   * @param options - The configuration options for the `CommandRouter`.
   * @returns A new instance of `CommandRouter` configured with the provided options.
   */
  static create<
    W extends IncomingEvent = IncomingEvent,
    X extends OutgoingResponse = OutgoingResponse
  >(options: CommandRouterEventHandlerOptions): CommandRouterEventHandler<W, X> {
    return new this(options)
  }

  /**
   * Create a new instance of CommandRouter.
   *
   * @param container - The container instance for dependency resolution.
   */
  constructor ({ blueprint, container }: CommandRouterEventHandlerOptions) {
    this.blueprint = blueprint
    this.container = container
  }

  /**
   * Retrieves the list of registered command classes.
   *
   * @returns An array of command constructor functions.
   */
  private get commands (): Array<MetaCommandHandler<W, X>> {
    return this.blueprint.get<Array<MetaCommandHandler<W, X>>>('stone.adapter.commands', [])
  }

  /**
   * Handle an incoming event.
   *
   * @param event - The incoming event to process.
   * @returns The outgoing response.
   */
  async handle (event: W): Promise<X> {
    return await this.dispatch(event)
  }

  /**
   * Dispatches an event to the appropriate command.
   *
   * @param event - The incoming event to be dispatched.
   * @returns The result of the command execution.
   */
  async dispatch (event: W): Promise<X> {
    return await this.runCommand(event, this.findCommand(event))
  }

  /**
   * Finds a command that matches the given event.
   *
   * @param event - The incoming event to match against commands.
   * @returns The matching command, or undefined if no match is found.
   */
  findCommand (event: W): ICommandHandler<W, X> | undefined {
    const commands = this.commands.map((command) => ({ options: command.options, command: this.resolveCommand(command) }))

    return (
      commands.find(({ command, options }) => this.checkCommandMatch(command, event, options)) ??
      commands.find(({ options }) => options.name === '*')
    )?.command
  }

  /**
   * Runs the given command with the provided event.
   *
   * @param event - The event to handle.
   * @param command - The command to execute.
   * @returns The result of the command execution, or void if no command is found.
   */
  async runCommand (event: W, command?: ICommandHandler<W, X>): Promise<X> {
    if (command === undefined) {
      return OutgoingResponse.create({ statusCode: COMMAND_NOT_FOUND_CODE }) as X
    } else if (typeof command.handle === 'function') {
      return await command.handle(event)
    } else {
      throw new NodeCliAdapterError('Command does not implement an "handle" method.')
    }
  }

  /**
   * Resolves a command instance from the container.
   *
   * @param metaCommand - The command constructor function.
   * @returns The resolved command instance.
   */
  private resolveCommand (metaCommand: MetaCommandHandler<W, X>): ICommandHandler<W, X> {
    let command: ICommandHandler<W, X> | undefined

    if (isMetaClassModule<CommandHandlerClass<W, X>>(metaCommand)) {
      command = this.container.resolve<ICommandHandler<W, X>>(metaCommand.module, true)
    } else if (isMetaFactoryModule<FactoryCommandHandler<W, X>>(metaCommand)) {
      const res = metaCommand.module(this.container)
      command = isFunctionModule<FunctionalCommandHandler<W, X>>(res) ? { handle: res } : res
    } else if (isMetaFunctionModule<FunctionalCommandHandler<W, X>>(metaCommand)) {
      command = { handle: metaCommand.module }
    }

    if (command === undefined) {
      throw new NodeCliAdapterError(`Failed to resolve command: ${metaCommand.options.name}`)
    }

    return command
  }

  /**
   * Checks if a command matches the given event.
   *
   * @param command - The command to check.
   * @param event - The event to match.
   * @returns True if the command matches; otherwise, false.
   */
  private checkCommandMatch (command: ICommandHandler<W, X>, event: W, options: CommandOptions): boolean {
    if (typeof command.match === 'function') {
      return command.match(event)
    } else {
      const task = event.getMetadataValue<string>('_task')
      return options.name === task || options.alias === task || (Array.isArray(options.alias) && options.alias.some((alias) => alias === task))
    }
  }
}

/**
 * MetaCommandRouterEventHandler module.
 */
export const MetaCommandRouterEventHandler = { module: CommandRouterEventHandler, isClass: true }
