import {
  Pipeline,
  MetaPipe,
  isClassPipe,
  isFactoryPipe,
  PipelineOptions
} from '@stone-js/pipeline'
import {
  isEmpty,
  isNotEmpty,
  isHandlerHasHook,
  isMetaClassModule,
  isObjectLikeModule,
  isMetaFactoryModule,
  isMetaFunctionModule
} from '../utils'
import {
  IAdapter,
  IBlueprint,
  AdapterHookType,
  AdapterContext,
  KernelHookName,
  AdapterHookName,
  RawResponseOptions,
  IRawResponseWrapper,
  IAdapterEventBuilder,
  IAdapterErrorHandler,
  AdapterMixedPipeType,
  AdapterEventHandlerType,
  AdapterEventBuilderType,
  IAdapterErrorHandlerClass,
  FactoryAdapterErrorHandler,
  AdapterEventHandlerResolver,
  ILifecycleAdapterEventHandler,
  FunctionalAdapterErrorHandler
} from '../declarations'
import { Logger } from '../logger/Logger'
import { OutgoingResponse } from '../events/OutgoingResponse'
import { IntegrationError } from '../errors/IntegrationError'
import { IncomingEvent, IncomingEventOptions } from '../events/IncomingEvent'

/**
 * Class representing an Adapter.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 *
 * @template RawEventType
 * @template RawResponseType
 * @template ExecutionContextType
 * @template IncomingEventType
 * @template IncomingEventOptionsType
 * @template OutgoingResponseType
 * @template AdapterContextType
 */
export abstract class Adapter<
  RawEventType,
  RawResponseType,
  ExecutionContextType,
  IncomingEventType extends IncomingEvent,
  IncomingEventOptionsType extends IncomingEventOptions,
  OutgoingResponseType extends OutgoingResponse,
  AdapterContextType extends AdapterContext<
  RawEventType,
  RawResponseType,
  ExecutionContextType,
  IncomingEventType,
  IncomingEventOptionsType,
  OutgoingResponseType
  > = AdapterContext<
  RawEventType,
  RawResponseType,
  ExecutionContextType,
  IncomingEventType,
  IncomingEventOptionsType,
  OutgoingResponseType
  >
> implements IAdapter {
  protected readonly hooks: AdapterHookType<AdapterContextType, RawResponseType>
  protected readonly middleware: Array<AdapterMixedPipeType<AdapterContextType, RawResponseType>>
  protected readonly resolvedErrorHandlers: Record<string, IAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>>

  /**
   * Create an Adapter.
   *
   * @param blueprint - The blueprint to create the adapter.
   */
  protected constructor (protected readonly blueprint: IBlueprint) {
    this.resolvedErrorHandlers = {}
    this.hooks = blueprint.get('stone.lifecycleHooks', {})
    this.middleware = blueprint.get('stone.adapter.middleware', [])
  }

  /**
   * Run handler.
   *
   * @example
   * Implementation flow
   * ```ts
   * await this.executeHooks('onStart');
   * const eventHandlerResolver = this.blueprint.get('stone.adapter.eventHandlerResolver');
   * const eventHandler = eventHandlerResolver(this.blueprint)
   * await this.executeHooks('onInit', eventHandler);
   * const rawEvent: MockRawEvent = { name: 'Stone.js' }
   * const context: AdapterContext<MockRawEvent, MockRawResponse, any, IncomingEvent, IncomingEventOptions, OutgoingResponse> = {
   *   rawEvent,
   *   incomingEventBuilder: AdapterBuilder.create<IncomingEventOptions, IncomingEvent>({ resolver: v => IncomingEvent.create(v) }),
   *   rawResponseBuilder: AdapterBuilder.create<RawResponseOptions, MockRawResponseWrapper>({ resolver: v => new MockRawResponseWrapper(v) })
   * }
   * return await this.sendEventThroughDestination(context, eventHandler);
   * ```
   * @returns The result of the handler execution.
   */
  abstract run<ExecutionResultType = unknown>(): Promise<ExecutionResultType>

  /**
   * Send the raw event through the destination.
   *
   * @param context - The event context.
   * @param eventHandler - The event handler to be run.
   * @returns Platform-specific response.
   * @throws IntegrationError
   */
  protected async sendEventThroughDestination (
    context: AdapterContextType,
    eventHandler: AdapterEventHandlerType<IncomingEventType, OutgoingResponseType>
  ): Promise<RawResponseType> {
    this.validateContextAndEventHandler(context, eventHandler)

    let rawResponseBuilder: AdapterEventBuilderType<RawResponseType>

    try {
      rawResponseBuilder = await Pipeline
        .create(this.makePipelineOptions())
        .send(context)
        .through(...this.middleware)
        .then(async (ctx) => await this.handleEvent(ctx, eventHandler))
    } catch (error: any) {
      rawResponseBuilder = await this.handleError(error, context)
    }

    return await this.buildRawResponse({ ...context, rawResponseBuilder }, eventHandler)
  }

  /**
   * Handle the event.
   *
   * @param context - The event context.
   * @param eventHandler - The event handler to be run.
   * @returns The raw response wrapper.
   */
  protected async handleEvent (
    context: AdapterContextType,
    eventHandler: AdapterEventHandlerType<IncomingEventType, OutgoingResponseType>
  ): Promise<IAdapterEventBuilder<RawResponseOptions, IRawResponseWrapper<RawResponseType>>> {
    await this.executeHooks('onBuildingIncomingEvent', context)

    context.incomingEvent = context.incomingEventBuilder.build()

    if (isEmpty(context.incomingEvent)) {
      throw new IntegrationError('No IncomingEvent provided')
    }

    await this.executeEventHandlerHooks('onHandlingEvent', eventHandler)

    context.outgoingResponse = isObjectLikeModule<ILifecycleAdapterEventHandler<IncomingEventType, OutgoingResponseType>>(eventHandler)
      ? await eventHandler.handle(context.incomingEvent)
      : await eventHandler(context.incomingEvent)

    await this.executeEventHandlerHooks('onEventHandled', eventHandler)

    return context.rawResponseBuilder
  }

  /**
   * Handle error.
   *
   * @param error - The error to handle.
   * @param context - The event context.
   * @returns The raw response.
   */
  protected async handleError (error: Error, context: AdapterContextType): Promise<AdapterEventBuilderType<RawResponseType>> {
    await this.executeHooks('onHandlingAdapterError', context, error)
    return await this.resolveErrorHandler(error).handle(error, context)
  }

  /**
   * Build the raw response.
   *
   * @param context - The event context.
   * @param eventHandler - The event handler to be run.
   * @returns The raw response wrapper.
   */
  protected async buildRawResponse (
    context: AdapterContextType,
    eventHandler?: AdapterEventHandlerType<IncomingEventType, OutgoingResponseType>
  ): Promise<RawResponseType> {
    await this.executeHooks('onBuildingRawResponse', context)

    const response = await context.rawResponseBuilder.build().respond()

    if (isNotEmpty<AdapterEventHandlerType<IncomingEventType, OutgoingResponseType>>(eventHandler)) {
      await this.executeEventHandlerHooks('onTerminate', eventHandler)
    }

    return response
  }

  /**
   * Create pipeline options for the Adapter.
   *
   * @returns The pipeline options for transforming the event.
   */
  protected makePipelineOptions (): PipelineOptions<AdapterContextType, AdapterEventBuilderType<RawResponseType>> {
    return {
      hooks: {
        onPipeProcessed: this.hooks.onAdapterMiddlewareProcessed ?? [],
        onProcessingPipe: this.hooks.onProcessingAdapterMiddleware ?? []
      },
      resolver: (metaPipe: MetaPipe<AdapterContextType, AdapterEventBuilderType<RawResponseType>>) => {
        if (isClassPipe(metaPipe)) {
          return new metaPipe.module.prototype.constructor({ blueprint: this.blueprint, logger: Logger.getInstance() })
        } else if (isFactoryPipe(metaPipe)) {
          return metaPipe.module({ blueprint: this.blueprint, logger: Logger.getInstance() })
        }
      }
    }
  }

  /**
   * Get the event handler for the adapter.
   *
   * @returns The event handler for the adapter.
   * @throws {NodeHttpAdapterError} If the event handler is missing.
   */
  protected resolveEventHandler (): AdapterEventHandlerType<IncomingEventType, OutgoingResponseType> {
    const resolver = this.blueprint.get<
    AdapterEventHandlerResolver<IncomingEventType, OutgoingResponseType>
    >('stone.adapter.eventHandlerResolver')

    if (isEmpty(resolver)) {
      throw new IntegrationError('The event handler resolver is missing.')
    }

    const eventHandler = resolver(this.blueprint)

    if (isEmpty(eventHandler)) {
      throw new IntegrationError('The event handler is missing.')
    }

    return eventHandler
  }

  /**
   * Get the error handler for the given error.
   *
   * @param error - The error to get the handler for.
   * @returns The error handler.
   * @throws IntegrationError
   */
  protected resolveErrorHandler (error: Error): IAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType> {
    if (isEmpty(this.resolvedErrorHandlers[error.name])) {
      const metaErrorHandler = this.blueprint.get(
        `stone.adapter.errorHandlers.${error.name}`
      ) ?? this.blueprint.get('stone.adapter.errorHandlers.default')

      if (isMetaClassModule<IAdapterErrorHandlerClass<RawEventType, RawResponseType, ExecutionContextType>>(metaErrorHandler)) {
        this.resolvedErrorHandlers[error.name] = new metaErrorHandler.module.prototype.constructor({ blueprint: this.blueprint })
      } else if (isMetaFactoryModule<FactoryAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>>(metaErrorHandler)) {
        this.resolvedErrorHandlers[error.name] = { handle: metaErrorHandler.module({ blueprint: this.blueprint }) }
      } else if (isMetaFunctionModule<FunctionalAdapterErrorHandler<RawEventType, RawResponseType, ExecutionContextType>>(metaErrorHandler)) {
        this.resolvedErrorHandlers[error.name] = { handle: metaErrorHandler.module }
      } else {
        throw new IntegrationError(`The error handler for ${String(error.name)} is not provided.`)
      }
    }

    return this.resolvedErrorHandlers[error.name]
  }

  /**
   * Execute the event handler lifecycle hooks.
   *
   * @param hook - The hook to execute.
   * @param eventHandler - The event handler to be run.
   */
  protected async executeEventHandlerHooks (
    hook: KernelHookName,
    eventHandler: AdapterEventHandlerType<IncomingEventType, OutgoingResponseType>
  ): Promise<void> {
    if (isHandlerHasHook(eventHandler, hook)) {
      await eventHandler[hook]()
    }
  }

  /**
   * Execute adapter lifecycle hooks.
   *
   * @param name - The hook's name.
   * @param context - The event context.
   * @param error - The error to handle.
   */
  protected async executeHooks (name: AdapterHookName, context?: AdapterContextType, error?: any): Promise<void> {
    if (
      Array.isArray(this.hooks[name]) &&
      name !== 'onAdapterMiddlewareProcessed' &&
      name !== 'onProcessingAdapterMiddleware'
    ) {
      for (const listener of this.hooks[name]) {
        await listener({ context, error, blueprint: this.blueprint })
      }
    }
  }

  /**
   * Validate the context and event handler.
   *
   * @param context - The context to validate.
   * @param eventHandler - The event handler to validate.
   * @throws IntegrationError
   */
  protected validateContextAndEventHandler (
    context: AdapterContextType,
    eventHandler: AdapterEventHandlerType<IncomingEventType, OutgoingResponseType>
  ): void {
    if (isEmpty(eventHandler)) { throw new IntegrationError('No eventHandler provided') }
    if (isEmpty(context.rawResponseBuilder?.build)) { throw new IntegrationError('No RawResponseBuilder provided') }
    if (isEmpty(context.incomingEventBuilder?.build)) { throw new IntegrationError('No IncomingEventBuilder provided') }
  }
}
