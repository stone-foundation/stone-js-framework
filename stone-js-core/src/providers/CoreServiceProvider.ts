import {
  isConstructor,
  isMetaClassModule,
  isMetaFactoryModule,
  isMetaFunctionModule
} from '../utils'
import {
  ILogger,
  IBlueprint,
  MetaService,
  IServiceClass,
  IEventListener,
  FactoryService,
  MetaMiddleware,
  MiddlewareClass,
  IServiceProvider,
  IEventSubscriber,
  MetaEventListener,
  IEventListenerClass,
  MixedEventSubscriber,
  FactoryEventListener,
  IEventSubscriberClass,
  FactoryEventSubscriber,
  FunctionalEventListener,
  FunctionalEventSubscriber
} from '../declarations'
import { Event } from '../events/Event'
import { EventEmitter } from '../events/EventEmitter'
import { Container } from '@stone-js/service-container'

/**
 * CoreServiceProvider options.
 */
export interface CoreServiceProviderOptions {
  logger: ILogger
  container: Container
  blueprint: IBlueprint
  eventEmitter: EventEmitter
}

/**
 * Class representing a CoreServiceProvider.
 *
 * The CoreServiceProvider is responsible for managing the core services,
 * listeners, subscribers, and adapters required by the application.
 * It interacts with the service container to bind and resolve dependencies,
 * ensuring all components are available when needed.
 *
 * @author Mr. Stone <evensstone@gmail.com>
 */
export class CoreServiceProvider implements IServiceProvider {
  private readonly logger: ILogger
  private readonly container: Container
  private readonly blueprint: IBlueprint
  private readonly eventEmitter: EventEmitter

  /**
   * Create a new instance of CoreServiceProvider.
   *
   * @param container - The service container to manage dependencies.
   * @throws {InitializationError} If the Blueprint config or EventEmitter is not bound to the container.
   */
  constructor ({ container, blueprint, eventEmitter, logger }: CoreServiceProviderOptions) {
    this.logger = logger
    this.container = container
    this.blueprint = blueprint
    this.eventEmitter = eventEmitter
  }

  /**
   * Get the list of services from the configuration.
   *
   * @returns A list of services or an array of service options.
   */
  private get services (): MetaService[] {
    return this.blueprint.get<MetaService[]>('stone.services', [])
  }

  /**
   * Get the list of middleware from the configuration.
   *
   * @returns A list of middleware.
   */
  private get middleware (): MetaMiddleware[] {
    return this
      .blueprint
      .get<MetaMiddleware[]>('stone.kernel.middleware', [])
      .concat(this.blueprint.get<MetaMiddleware[]>('stone.middleware', []))
  }

  /**
   * Get the list of listeners from the configuration.
   *
   * @returns A record of event listeners.
   */
  private get listeners (): MetaEventListener[] {
    return this.blueprint.get<MetaEventListener[]>('stone.listeners', [])
  }

  /**
   * Get the list of subscribers from the configuration.
   *
   * @returns A list of subscribers.
   */
  private get subscribers (): MixedEventSubscriber[] {
    return this.blueprint.get<MixedEventSubscriber[]>('stone.subscribers', [])
  }

  /**
   * Get the list of aliases from the configuration.
   *
   * @returns A record of class aliases.
   */
  private get aliases (): Record<string, any> {
    return this.blueprint.get<Record<string, any>>('stone.aliases', {})
  }

  /**
   * Register core components in the service container.
   *
   * This method registers services, listeners, adapters, and aliases in the container.
   */
  public register (): void {
    this.registerServices()
    this.registerMiddleware()
    this.registerAliases()
  }

  /**
   * Boot core components.
   *
   * This method is used to bootstrap subscribers.
   */
  public async boot (): Promise<void> {
    this.registerListeners()
    await this.bootSubscribers()
  }

  /**
   * Register aliases in the service container.
   *
   * @returns This CoreServiceProvider instance for chaining.
   */
  private registerAliases (): void {
    Object
      .entries(this.aliases)
      .forEach(
        ([alias, Class]) => isConstructor(Class) && this.container.alias(Class, alias)
      )
  }

  /**
   * Register decorated and imported services.
   *
   * @returns This CoreServiceProvider instance for chaining.
   */
  private registerServices (): void {
    this.services.forEach(service => {
      const { singleton = true, alias = [] } = service

      if (isMetaClassModule<IServiceClass>(service)) {
        this.container.autoBinding(service.module, service.module, singleton, alias)
      } else if (isMetaFactoryModule<FactoryService>(service)) {
        const [name, ...aliases] = [alias].flat()
        this.container.autoBinding(name, service.module, true, aliases)
      }
    })
  }

  /**
   * Register decorated and imported middleware.
   *
   * @returns This CoreServiceProvider instance for chaining.
   */
  private registerMiddleware (): void {
    this.middleware.forEach(middleware => {
      const { singleton = true, alias = [] } = middleware

      if (isMetaClassModule<MiddlewareClass>(middleware)) {
        this.container.autoBinding(middleware.module, middleware.module, singleton, alias)
      }
    })
  }

  /**
   * Register decorated and imported listeners in the event emitter.
   *
   * @returns This CoreServiceProvider instance for chaining.
   */
  private registerListeners (): void {
    for (const listener of this.listeners) {
      const { event: eventName } = listener
      let instance: IEventListener | undefined

      if (isMetaClassModule<IEventListenerClass>(listener)) {
        instance = this.container.resolve<IEventListener>(listener.module, true)
      } else if (isMetaFactoryModule<FactoryEventListener>(listener)) {
        instance = { handle: listener.module(this.container) }
      } else if (isMetaFunctionModule<FunctionalEventListener>(listener)) {
        instance = { handle: listener.module }
      }

      if (instance?.handle !== undefined) {
        this.eventEmitter.on(eventName, async (event: Event) => {
          try {
            await instance.handle(event)
          } catch (error: any) {
            this.logger.error(`An error has occured with this listener (${String(listener)}) ${String(error.message)}`)
          }
        })
      }
    }
  }

  /**
   * Bootstrap subscribers by resolving them from the container and subscribing to the event emitter.
   *
   * @returns This CoreServiceProvider instance for chaining.
   */
  private async bootSubscribers (): Promise<void> {
    for (const subscriber of this.subscribers) {
      let instance: IEventSubscriber | undefined

      if (isMetaClassModule<IEventSubscriberClass>(subscriber)) {
        instance = this.container.resolve<IEventSubscriber>(subscriber.module, true)
      } else if (isMetaFactoryModule<FactoryEventSubscriber>(subscriber)) {
        instance = { subscribe: subscriber.module(this.container) }
      } else if (isMetaFunctionModule<FunctionalEventSubscriber>(subscriber)) {
        instance = { subscribe: subscriber.module }
      } else if (isConstructor(subscriber)) {
        instance = this.container.resolve<IEventSubscriber>(subscriber, true)
      }

      try {
        await instance?.subscribe(this.eventEmitter)
      } catch (error: any) {
        this.logger.error(`An error has occured with this subscriber (${String(subscriber)}) ${String(error.message)}`)
      }
    }
  }
}
