import { RealtimeConfig } from './declarations'
import { RealtimeClient } from './RealtimeClient'
import { RealtimeError } from './errors/RealtimeError'
import { IBlueprint, IContainer, IServiceProvider, Promiseable } from '@stone-js/core'

/**
 * Wires the isomorphic {@link RealtimeClient} into the container (the frontend counterpart of
 * {@link RealtimeServiceProvider}).
 *
 * From `stone.realtime.url` it builds a {@link RealtimeClient} and binds it as `realtime`, so the
 * frontend domain emits and listens through the exact same {@link Broadcaster} API as the backend.
 * The concrete transport (a WebSocket) is the context; the domain never sees it.
 */
export class RealtimeClientServiceProvider implements IServiceProvider {
  /**
   * @param container - The service container.
   */
  constructor (private readonly container: IContainer) {}

  /**
   * Register the realtime client.
   *
   * @throws {RealtimeError} When `stone.realtime.url` is not configured.
   */
  register (): Promiseable<void> {
    const config = this.container.make<IBlueprint>('blueprint').get<RealtimeConfig>('stone.realtime', {})

    if (typeof config.url !== 'string') {
      throw new RealtimeError('A realtime client requires `stone.realtime.url` (the WebSocket endpoint).')
    }

    const client = RealtimeClient.create({ url: config.url })

    this.container
      .instanceIf(RealtimeClient, client)
      .alias(RealtimeClient, ['realtimeClient'])
      .singletonIf('realtime', () => client)
  }
}
