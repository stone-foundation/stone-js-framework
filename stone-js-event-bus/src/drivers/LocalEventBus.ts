import { LOCAL } from '../constants'
import { EventBusConnection } from '../declarations'

/**
 * The minimal emitter shape the local driver needs (satisfied by the core `EventEmitter`).
 */
export interface EmitterLike {
  emit: (name: string, payload?: any) => Promise<void> | void
}

/**
 * In-process bus connection.
 *
 * Delivers to the application's own `EventEmitter`, so the same `emit` code reaches in-process
 * listeners in a monolith. The emitter is *used*, never modified: the core stays untouched.
 */
export class LocalEventBus implements EventBusConnection {
  readonly name: string

  /**
   * Create a local connection.
   *
   * @param emitter - The application event emitter.
   * @param name - The connection name.
   * @returns A new connection.
   */
  static create (emitter: EmitterLike, name: string = LOCAL): LocalEventBus {
    return new this(emitter, name)
  }

  /**
   * @param emitter - The application event emitter.
   * @param name - The connection name.
   */
  constructor (private readonly emitter: EmitterLike, name: string = LOCAL) {
    this.name = name
  }

  /** @inheritdoc */
  async emit <T = unknown>(name: string, payload?: T): Promise<void> {
    await this.emitter.emit(name, payload)
  }
}
