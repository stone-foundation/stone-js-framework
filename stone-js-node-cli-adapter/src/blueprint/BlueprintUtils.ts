import { NODE_CONSOLE_PLATFORM } from '../constants'
import { CommandOptions } from '../decorators/Command'
import { NodeConsoleAdapterBlueprint } from '../options/NodeConsoleAdapterBlueprint'
import { BlueprintContext, ClassType, IBlueprint, IncomingEvent, NextMiddleware } from '@stone-js/core'
import { CommandHandlerClass, CommandHandlerType, FactoryCommandHandler, FunctionalCommandHandler } from '../declarations'

/**
 * Utility function to define a function-based command handler for the Node Console Adapter.
 *
 * @param module - The CommandHandler module.
 * @param options - The metadata options for the handler.
 * @returns The NodeConsoleAdapterBlueprint.
 */
export function defineCommand<U extends IncomingEvent = IncomingEvent, V = unknown> (
  module: FunctionalCommandHandler<U, V>,
  options: CommandOptions
): Partial<NodeConsoleAdapterBlueprint>

/**
 * Utility function to define a factory-based command handler for the Node Console Adapter.
 *
 * @param module - The CommandHandler module.
 * @param options - The metadata options for the handler.
 * @returns The NodeConsoleAdapterBlueprint.
 */
export function defineCommand<U extends IncomingEvent = IncomingEvent, V = unknown> (
  module: FactoryCommandHandler<U, V>,
  options: CommandOptions & { isFactory: true }
): Partial<NodeConsoleAdapterBlueprint>

/**
 * Utility function to define a class-based command handler for the Node Console Adapter.
 *
 * @param module - The CommandHandler module.
 * @param options - The metadata options for the handler.
 * @returns The NodeConsoleAdapterBlueprint.
 */
export function defineCommand<U extends IncomingEvent = IncomingEvent, V = unknown> (
  module: CommandHandlerClass<U, V>,
  options: CommandOptions & { isClass: true }
): Partial<NodeConsoleAdapterBlueprint>

/**
 * Utility function to define a command handler for the Node Console Adapter.
 *
 * @param module - The CommandHandler module.
 * @param options - The metadata options for the handler.
 * @returns The NodeConsoleAdapterBlueprint.
 */
export function defineCommand<U extends IncomingEvent = IncomingEvent, V = unknown> (
  module: CommandHandlerType<U, V>,
  options: CommandOptions & { isClass?: boolean, isFactory?: boolean }
): Partial<NodeConsoleAdapterBlueprint> {
  const AdapterMiddleware = async (
    context: BlueprintContext<IBlueprint, ClassType>,
    next: NextMiddleware<BlueprintContext<IBlueprint, ClassType>, IBlueprint>
  ): Promise<IBlueprint> => {
    const blueprint = await next(context)

    if (blueprint.is('stone.adapter.platform', NODE_CONSOLE_PLATFORM)) {
      blueprint.add('stone.adapter.commands', [{
        options,
        isClass: options.isClass,
        isFactory: options.isFactory,
        module: module as CommandHandlerType<IncomingEvent, V>
      }])
    }

    return blueprint
  }

  return {
    stone: {
      blueprint: {
        middleware: [
          { module: AdapterMiddleware }
        ]
      }
    }
  }
}
