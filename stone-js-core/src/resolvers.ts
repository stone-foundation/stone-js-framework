import { Kernel } from './Kernel'
import { EventEmitter } from './events/EventEmitter'
import { IncomingEvent } from './events/IncomingEvent'
import { ConsoleLogger } from './logger/ConsoleLogger'
import { Container } from '@stone-js/service-container'
import { OutgoingResponse } from './events/OutgoingResponse'
import { IBlueprint, ResponseResolverOptions } from './declarations'

/**
 * Default logger resolver function.
 *
 * This function resolves the logger for the application, using the blueprint configuration.
 * By default, it creates a `ConsoleLogger` instance with the provided blueprint.
 *
 * @param blueprint - The blueprint configuration to use for the logger.
 * @returns A `ConsoleLogger` instance.
 */
export function defaultLoggerResolver (blueprint: IBlueprint): ConsoleLogger {
  return ConsoleLogger.create({ blueprint })
}

/**
 * Default response resolver function.
 *
 * This function resolves the response for the application, using the options provided.
 * By default, it creates an `OutgoingResponse` instance with the provided options.
 *
 * @param options - The options to create the response.
 * @returns An outgoing response instance.
 */
export function defaultResponseResolver (options: ResponseResolverOptions): OutgoingResponse {
  return OutgoingResponse.create(options)
}

/**
 * Default kernel resolver function.
 *
 * This function resolves the kernel for the application, using the blueprint configuration.
 * It creates a `Kernel` instance with the given blueprint, logger, container, and an event emitter.
 *
 * @template U, V
 * @param blueprint - The blueprint configuration to use for the kernel.
 * @returns A `Kernel` instance configured with the provided blueprint.
 */
export function defaultKernelResolver<U extends IncomingEvent, V extends OutgoingResponse> (blueprint: IBlueprint): Kernel<U, V> {
  return Kernel.create({ blueprint, container: Container.create(), eventEmitter: EventEmitter.create() })
}
