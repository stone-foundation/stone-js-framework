import { BusMessage, EventBusConnection } from '../declarations'

/**
 * In-memory bus connection.
 *
 * Records every emitted message on `events` instead of hitting a real transport. Useful in tests and
 * local development to assert what would have been published.
 */
export class MemoryEventBus implements EventBusConnection {
  readonly name: string

  /** The messages emitted so far, in order. */
  readonly events: BusMessage[] = []

  /**
   * Create a memory connection.
   *
   * @param name - The connection name.
   * @returns A new connection.
   */
  static create (name: string = 'memory'): MemoryEventBus {
    return new this(name)
  }

  /**
   * @param name - The connection name.
   */
  constructor (name: string = 'memory') {
    this.name = name
  }

  /** @inheritdoc */
  async emit <T = unknown>(name: string, payload?: T): Promise<void> {
    this.events.push({ name, payload })
  }
}
