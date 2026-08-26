import { Notifier } from './Notifier'
import { LogChannel } from './channels/LogChannel'
import { SmtpChannel } from './channels/SmtpChannel'
import { InAppChannel, BroadcasterLike } from './channels/InAppChannel'
import { NotificationManager } from './NotificationManager'
import { NotificationConfigurationError } from './errors/NotificationError'
import { IBlueprint, IContainer, ILogger, IServiceProvider, Promiseable } from '@stone-js/core'
import { ChannelConfig, NotificationChannel, NotificationChannelFactory, NotificationsConfig } from './declarations'

/**
 * Binds the channels and the notifier.
 *
 * Everything is built for this event, like the rest of the container. A channel holding a connection
 * holds it itself, because a connection is a resource and the channel is the boundary that owns it;
 * nothing here keeps state between events.
 */
export class NotificationServiceProvider implements IServiceProvider {
  constructor (private readonly container: IContainer) {}

  register (): Promiseable<void> {
    const blueprint = this.container.make<IBlueprint>('blueprint')
    const config = blueprint.get<NotificationsConfig>('stone.notifications', {})
    const manager = NotificationManager.create()

    // Always available, so an application that calls `notify()` and configures nothing sees what it
    // would have sent instead of a configuration error.
    manager.registerFactory('log', () => LogChannel.create({ name: 'log' }, this.logger()))

    for (const channel of config.channels ?? []) {
      this.registerChannel(manager, channel)
    }

    NotificationManager.setInstance(manager)

    this.container
      .instanceIf(NotificationManager, manager)
      .alias(NotificationManager, ['notificationManager', 'channels'])
      .singletonIf(Notifier, () => new Notifier({ blueprint, container: this.container }))
      .alias(Notifier, ['notifier'])
  }

  /**
   * Register one configured channel, lazily: a transport is built when first used, not at boot, so an
   * application configured for production does not need a mail server to start locally.
   *
   * @param manager - The registry to register into.
   * @param config - What the application declared.
   */
  private registerChannel (manager: NotificationManager, config: ChannelConfig): void {
    // A channel the application builds itself, declared where the others are. Registering it on the
    // manager from a provider reads well and does not survive: the container is rebuilt per event.
    if (typeof config.factory === 'function') {
      manager.registerFactory(config.name, () => config.factory?.(config) as NotificationChannel)
      return
    }

    // A class the application declared with `@NotificationChannel`. Built through the container, so
    // its constructor is auto-wired: a channel needing a provider client asks for it.
    if (typeof config.module === 'function') {
      manager.registerFactory(config.name, () => this.build(config))
      return
    }

    const driver = config.driver ?? 'log'
    const factory = this.driverFor(driver)

    if (factory === undefined) {
      throw new NotificationConfigurationError(
        `Unknown notification driver '${driver}'. Ships with 'log', 'in-app' and 'smtp'. To reach a ` +
        'provider this package has never heard of, and that is how `sms` and `push` are done, ' +
        'declare the channel with a `factory` instead of a `driver`: ' +
        '`channels: [{ name: \'sms\', factory: () => myChannel }]`.'
      )
    }

    manager.registerFactory(config.name, () => factory(config))
  }

  /**
   * A declared channel class, built.
   *
   * @param config - What the application declared.
   * @returns The channel.
   * @throws {NotificationConfigurationError} When the class cannot be built.
   */
  private build (config: ChannelConfig): NotificationChannel {
    const built = this.container.resolve?.<NotificationChannel>(config.module as any, true)

    if (built === undefined || typeof built.send !== 'function') {
      throw new NotificationConfigurationError(
        `The channel declared as '${config.name}' does not answer \`send(message, recipient)\`. ` +
        'A channel is anything with that method, and it returns an outcome rather than throwing.'
      )
    }

    return built
  }

  /**
   * The builder for a driver this package ships.
   *
   * @param driver - The driver's name.
   * @returns The factory, or nothing when the name is not one of ours.
   */
  private driverFor (driver: string): NotificationChannelFactory | undefined {
    return {
      log: (config: ChannelConfig) => LogChannel.create(config, this.logger()),
      'in-app': (config: ChannelConfig) => InAppChannel.create(config as any, this.broadcaster()),
      smtp: (config: ChannelConfig) => SmtpChannel.create(config as any)
    }[driver]
  }

  /** The realtime broadcaster, when one is bound. */
  private broadcaster (): BroadcasterLike | undefined {
    // The container is not optional here, so `has` answers a boolean outright.
    return this.container.has('broadcaster')
      ? this.container.make<BroadcasterLike>('broadcaster')
      : undefined
  }

  /** The logger, when one is bound. */
  private logger (): ILogger | undefined {
    return this.container.has('logger') ? this.container.make<ILogger>('logger') : undefined
  }
}
