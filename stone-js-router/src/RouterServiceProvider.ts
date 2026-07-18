import { Router } from './Router'
import { IEventEmitter, RouterOptions, StoneIncomingEvent } from './declarations'
import { IBlueprint, IContainer, IServiceProvider, OutgoingResponse, Promiseable } from '@stone-js/core'

/**
 * Options for configuring the router service provider.
 */
export interface RouterServiceProviderOptions {
  container: IContainer
}

/**
 * Router Service Provider.
 */
export class RouterServiceProvider<
  IncomingEventType extends StoneIncomingEvent = StoneIncomingEvent,
  OutgoingResponseType extends OutgoingResponse = OutgoingResponse
> implements IServiceProvider {
  /**
   * Constructs a new `RouterServiceProvider` instance.
   *
   * @param container - The container to register the Router service provider with.
   */
  constructor (private readonly container: IContainer) {}

  /**
   * Register the Router service provider.
   */
  register (): Promiseable<void> {
    this.registerRouter()
  }

  /**
   * Register the Router to the container.
  */
  private registerRouter (): void {
    this
      .container
      .singletonIf(Router, (container) => Router.create(this.getRouterOptions(container)))
      .alias(Router, ['Router', 'router'])
  }

  private getRouterOptions (container: IContainer): RouterOptions<IncomingEventType, OutgoingResponseType> {
    const routerOptions = container
      .make<IBlueprint>('blueprint')
      .get<RouterOptions<IncomingEventType, OutgoingResponseType>>('stone.router', {} as any)

    return {
      ...routerOptions,
      dependencyResolver: container,
      eventEmitter: container.make<IEventEmitter>('eventEmitter')
    }
  }
}
