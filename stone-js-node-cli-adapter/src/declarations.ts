import {
  IContainer,
  Promiseable,
  IncomingEvent,
  AdapterContext,
  OutgoingResponse,
  RawResponseOptions,
  IAdapterEventBuilder,
  IncomingEventOptions
} from '@stone-js/core'
import { Argv } from 'yargs'
import { CommandOptions } from './decorators/Command'
import { RawResponseWrapper } from './RawResponseWrapper'

/**
 * Represents a generic raw response as a number.
 */
export type RawResponse = number

/**
 * Represents the CommandBuilder as yargs.
 */
export type CommandBuilder = Argv<{}>

/**
 * Represents the Node Cli execution context as yargs.
 */
export type NodeCliExecutionContext = CommandBuilder

/**
 * Represents the response builder for the Node cli Adapter.
 */
export type NodeCliAdapterResponseBuilder = IAdapterEventBuilder<RawResponseOptions, RawResponseWrapper>

/**
 * Represents CommandHandlerClass.
 */
export type CommandHandlerClass<
  W extends IncomingEvent = IncomingEvent,
  X = unknown
> = new (...args: any[]) => ICommandHandler<W, X>

/**
 * Represents the CommandHandler function for the Node Cli Adapter.
 */
export interface ICommandHandler<
  W extends IncomingEvent = IncomingEvent,
  X = unknown
> {
  handle: FunctionalCommandHandler<W, X>
  match?: (event: IncomingEvent) => boolean
}

/**
 * Represents FactoryCommandHandler.
 */
export type FactoryCommandHandler<
  W extends IncomingEvent = IncomingEvent,
  X = unknown
> = (container: IContainer | any) => ICommandHandler<W, X> | FunctionalCommandHandler<W, X>

/**
 * Represents FunctionalCommandHandler.
 */
export type FunctionalCommandHandler<
  W extends IncomingEvent = IncomingEvent,
  X = unknown
> = (incomingEvent: W) => Promiseable<X>

/**
 * Represents CommandHandlerType.
 */
export type CommandHandlerType<
  W extends IncomingEvent = IncomingEvent,
  X = unknown
> = CommandHandlerClass<W, X> | FactoryCommandHandler<W, X> | FunctionalCommandHandler<W, X>

/**
 * Represents MetaCommandHandler.
 */
export interface MetaCommandHandler<
  W extends IncomingEvent = IncomingEvent,
  X = unknown
> {
  isClass?: boolean
  isFactory?: boolean
  options: CommandOptions
  module: CommandHandlerType<W, X>
}

/**
 * Represents a generic Node Cli event as a key-value pair.
 */
export interface NodeCliEvent {
  [x: string]: unknown
  _script: string
  _extra: Array<string | number>
}

/**
 * Represents the context for the Node Cli Adapter.
 *
 * This interface extends `AdapterContext` and includes additional properties
 * specific to generic Node Cli events.
 */
export interface NodeCliAdapterContext extends AdapterContext<
NodeCliEvent,
RawResponse,
NodeCliExecutionContext,
IncomingEvent,
IncomingEventOptions,
OutgoingResponse
> {
  /**
   * The raw response associated with the current context.
   */
  rawResponse: RawResponse
}
