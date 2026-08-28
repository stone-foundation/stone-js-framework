import { NotificationConfigurationError } from './errors/NotificationError'
import { Channel } from './declarations'

/**
 * Holds the configured channels and hands one out by name.
 *
 * The same shape every driver-based module in the framework uses, and the same lifetime: built for
 * one event, like the container it belongs to. It is a registry of factories, so rebuilding it costs
 * nothing. Nothing here holds state between events; a channel that needs a connection holds it
 * itself, because a connection is a resource and the channel is the boundary that owns it.
 */
export class NotificationManager {
  private static current?: NotificationManager

  private readonly channels = new Map<string, Channel>()
  private readonly factories = new Map<string, () => Channel>()

  /**
   * @returns A manager.
   */
  static create (): NotificationManager {
    return new this()
  }

  /** Publish the manager, so code outside the container can reach it. */
  static setInstance (manager?: NotificationManager): void {
    NotificationManager.current = manager
  }

  /** The published manager, if there is one. */
  static getInstance (): NotificationManager | undefined {
    return NotificationManager.current
  }

  /**
   * Register a built channel.
   *
   * @param channel - The channel.
   * @returns This manager.
   */
  register (channel: Channel): this {
    this.channels.set(channel.name, channel)
    return this
  }

  /**
   * Register a channel to be built on first use.
   *
   * @param name - The name notifications refer to it by.
   * @param factory - How to build it.
   * @returns This manager.
   */
  registerFactory (name: string, factory: () => Channel): this {
    this.factories.set(name, factory)
    return this
  }

  /** Whether a channel is registered under this name. */
  has (name: string): boolean {
    return this.channels.has(name) || this.factories.has(name)
  }

  /** The names of every registered channel. */
  names (): string[] {
    return [...new Set([...this.channels.keys(), ...this.factories.keys()])]
  }

  /**
   * The channel a notification named.
   *
   * @param name - The channel's name.
   * @returns The channel.
   * @throws {NotificationConfigurationError} When nothing is registered under that name.
   */
  channel (name: string): Channel {
    const built = this.channels.get(name)
    if (built !== undefined) { return built }

    const factory = this.factories.get(name)

    if (factory === undefined) {
      throw new NotificationConfigurationError(
        `No notification channel is registered as '${name}'. Configure it under ` +
        '`stone.notifications.channels`, or register your own with ' +
        '`channels: [{ name, factory }]`. Ships with \'log\', \'in-app\' and \'smtp\'.'
      )
    }

    const channel = factory()
    this.channels.set(name, channel)

    return channel
  }
}
