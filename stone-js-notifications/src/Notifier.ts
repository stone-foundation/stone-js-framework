import { render, TranslatorLike } from './render'
import { NotificationManager } from './NotificationManager'
import { NotificationConfigurationError } from './errors/NotificationError'
import { DEFAULT_CHANNEL, DELIVERY_JOB } from './constants'
import { IBlueprint, IContainer, ILogger } from '@stone-js/core'
import {
  DeliveryOutcome, NotificationReceipt, NotificationsConfig, NotifyOptions, Recipient, RecipientInput
} from './declarations'

/** The shape this module needs from a queue, duck-typed so `@stone-js/queue` is never imported. */
export interface QueueLike {
  dispatch: <T>(name: string, payload: T, options?: Record<string, unknown>) => Promise<string>
}

/** What a queued delivery carries. Resolved and rendered already: a worker guesses nothing. */
export interface DeliveryPayload {
  recipient: Recipient
  template: string
  params: Record<string, unknown>
  locale: string
  channels: string[]
}

/**
 * What an application calls to reach someone.
 *
 * The one sentence that shapes everything here: **decide now, deliver later.** A request resolves who
 * the person is, renders the message in their language, and hands the delivery to a queue. Reaching a
 * mail provider takes as long as it takes, and a request that waits for one is a request that times
 * out on a function-as-a-service platform, from the endpoint the user is watching.
 *
 * It also never throws at its caller. A notification is almost always a side effect of something that
 * already succeeded: an account was created, a guardian was invited. Failing that operation because a
 * mail provider was down would undo work that was correct. Every failure comes back as an outcome and
 * goes to the log.
 */
export class Notifier {
  private readonly blueprint: IBlueprint
  private readonly container?: IContainer

  /**
   * @param dependencies - Auto-wired services.
   */
  constructor ({ blueprint, container }: { blueprint: IBlueprint, container?: IContainer }) {
    this.blueprint = blueprint
    this.container = container
  }

  /**
   * Tell someone something.
   *
   * @param to - Who to tell: a recipient, an id, or several of either.
   * @param template - The template key. Never a rendered body: what is not copied does not have to
   *                   be erased, and a key survives a translation being fixed.
   * @param params - What the template needs.
   * @param options - Which channels, which language, whether to wait.
   * @returns What happened, or that it was queued.
   */
  async notify (
    to: RecipientInput | RecipientInput[],
    template: string,
    params: Record<string, unknown> = {},
    options: NotifyOptions = {}
  ): Promise<NotificationReceipt> {
    const recipients = await this.resolveAll([to].flat())
    const channels = options.channels ?? this.options().default ?? [DEFAULT_CHANNEL]

    this.warnOnceAboutTheDefault(channels)

    const queue = this.queue(options)

    if (queue !== undefined) {
      await Promise.all(recipients.map(async (recipient) => {
        await this.enqueue(queue, recipient, template, params, channels, options)
      }))

      return { queued: true, deliveries: [] }
    }

    const deliveries: DeliveryOutcome[] = []

    for (const recipient of recipients) {
      deliveries.push(...await this.deliver({
        recipient,
        template,
        params,
        channels,
        locale: this.localeFor(recipient, options)
      }))
    }

    return { queued: false, deliveries }
  }

  /**
   * Perform one delivery, to one person, on every channel it names.
   *
   * Called here when nothing is queued, and by the queue job when something is. Same code either way,
   * which is what makes a retry mean exactly what the first attempt meant.
   *
   * @param payload - Who, what, where, in which language.
   * @returns What each channel answered.
   */
  async deliver (payload: DeliveryPayload): Promise<DeliveryOutcome[]> {
    const manager = this.manager()
    const message = render({
      template: payload.template,
      params: payload.params,
      locale: payload.locale,
      templates: this.options().templates,
      translator: this.translator()
    })

    const outcomes: DeliveryOutcome[] = []

    for (const name of payload.channels) {
      outcomes.push(await this.sendOn(manager, name, message, payload.recipient))
    }

    return outcomes
  }

  /**
   * One channel, one message, and an answer whatever happens.
   *
   * A channel that throws is treated as **retryable**, because a throw is an adapter bug rather than
   * a verdict, and burying a channel's whole traffic the day a provider client changes its error
   * shapes would be worse than one retry too many.
   *
   * @param manager - The channel registry.
   * @param name - The channel to use.
   * @param message - The rendered notification.
   * @param recipient - Who it is for.
   * @returns The outcome, always.
   */
  private async sendOn (
    manager: NotificationManager,
    name: string,
    message: ReturnType<typeof render>,
    recipient: Recipient
  ): Promise<DeliveryOutcome> {
    try {
      const outcome = await manager.channel(name).send(message, recipient)

      if (outcome.status !== 'sent') {
        this.logger()?.warn(`[@stone-js/notifications] ${message.template} not delivered on '${name}'`, {
          status: outcome.status,
          retryable: outcome.retryable,
          reason: outcome.reason
        })
      }

      return { ...outcome, channel: name }
    } catch (error: any) {
      // A setup mistake will fail identically on every attempt, so it is reported as permanent. Every
      // other throw is an adapter bug rather than a verdict, and is worth one more try: burying a
      // channel's whole traffic the day a provider client changes its error shapes would be worse.
      const configuration = error instanceof NotificationConfigurationError

      this.logger()?.error?.(`[@stone-js/notifications] the '${name}' channel threw`, {
        template: message.template,
        configuration,
        reason: error?.message
      })

      return {
        status: 'failed',
        retryable: !configuration,
        reason: String(error?.message ?? 'The channel threw.'),
        channel: name
      }
    }
  }

  /**
   * Hand one delivery to the queue.
   *
   * Rendered arguments are **not** carried: the payload holds the key and the params, so a message
   * queued before a translation was fixed goes out fixed, and a queue dump holds no message bodies.
   *
   * @param queue - The queue.
   * @param recipient - Who it is for.
   * @param template - The template key.
   * @param params - What it needs.
   * @param channels - Where to send it.
   * @param options - What the caller asked for.
   */
  private async enqueue (
    queue: QueueLike,
    recipient: Recipient,
    template: string,
    params: Record<string, unknown>,
    channels: string[],
    options: NotifyOptions
  ): Promise<void> {
    const payload: DeliveryPayload = {
      recipient,
      template,
      params,
      channels,
      locale: this.localeFor(recipient, options)
    }

    const settings = this.options()

    try {
      await queue.dispatch(DELIVERY_JOB, payload, {
        ...(settings.queue !== undefined ? { queue: settings.queue } : {}),
        ...(settings.attempts !== undefined ? { attempts: settings.attempts } : {})
      })
    } catch (error: any) {
      // A queue that cannot take the work must not take down the operation that caused it. It is
      // logged rather than raised, and loudly, because a notification nobody queued is one nobody
      // will ever see fail.
      this.logger()?.error?.('[@stone-js/notifications] a delivery could not be queued', {
        template,
        reason: error?.message
      })
    }
  }

  /**
   * Everyone this notification is for, as people rather than ids.
   *
   * An id is resolved through the application's own directory, so the address is read at send time.
   * One that resolves to nobody is dropped with a warning: sending to an id nobody recognises is not
   * something to guess at.
   *
   * @param inputs - The recipients, or their ids.
   * @returns The recipients that could be resolved.
   */
  private async resolveAll (inputs: RecipientInput[]): Promise<Recipient[]> {
    const resolver = this.options().recipients
    const resolved: Recipient[] = []

    for (const input of inputs) {
      if (typeof input !== 'string') { resolved.push(input); continue }

      if (resolver === undefined) {
        this.logger()?.warn(
          '[@stone-js/notifications] a notification named a recipient by id, and nothing can turn an ' +
          'id into a person. Set `stone.notifications.recipients`, or pass the recipient itself.',
          { id: input }
        )
        continue
      }

      const recipient = await resolver(input)

      if (recipient === undefined) {
        this.logger()?.warn('[@stone-js/notifications] a recipient could not be resolved', { id: input })
        continue
      }

      resolved.push(recipient)
    }

    return resolved
  }

  /**
   * The language to write in.
   *
   * The recipient's own, first and almost always. An explicit override exists because a few messages
   * are genuinely about the sender's context, and it is rarely the right answer.
   *
   * @param recipient - Who it is for.
   * @param options - What the caller asked for.
   * @returns The locale.
   */
  private localeFor (recipient: Recipient, options: NotifyOptions): string {
    return options.locale ??
      recipient.locale ??
      this.blueprint.get<string>('stone.i18n.locale', 'en')
  }

  /**
   * The queue to dispatch on, or nothing when this delivery happens here.
   *
   * @param options - What the caller asked for.
   * @returns The queue, or nothing.
   */
  private queue (options: NotifyOptions): QueueLike | undefined {
    if (options.inline === true) { return undefined }

    const configured = this.options().dispatch
    const queue = this.container?.has?.('queue') === true
      ? this.container.make<QueueLike>('queue')
      : undefined

    if (configured === 'inline') { return undefined }

    if (queue?.dispatch === undefined) {
      if (configured === 'queue') {
        this.logger()?.warn(
          '[@stone-js/notifications] delivery is configured to be queued, and no queue is enabled, ' +
          'so it happens in the request instead. Enable @stone-js/queue, or set ' +
          '`stone.notifications.dispatch` to \'inline\' to say you meant it.'
        )
      }
      return undefined
    }

    return queue
  }

  /**
   * Say once that nothing is being delivered.
   *
   * The zero-config default writes to the log and reaches nobody. That is the right default, and a
   * module that delivered nothing while looking like one that delivers is the failure this warning
   * exists to prevent.
   *
   * @param channels - The channels in use.
   */
  private warnOnceAboutTheDefault (channels: string[]): void {
    if (this.warned || channels.length !== 1 || channels[0] !== DEFAULT_CHANNEL) { return }
    if (this.options().channels?.some((channel) => channel.name === DEFAULT_CHANNEL) === true) { return }

    this.warned = true
    this.logger()?.warn(
      '[@stone-js/notifications] notifications are going to the log, which reaches nobody. Configure ' +
      'a channel and name it in `stone.notifications.default` when you want them delivered.'
    )
  }

  /** Whether the default has already been reported, for this notifier. */
  private warned = false

  /** The `stone.notifications` bucket. */
  private options (): NotificationsConfig {
    return this.blueprint.get<NotificationsConfig>('stone.notifications', {})
  }

  /** The channel registry, from the container when there is one. */
  private manager (): NotificationManager {
    const fromContainer = this.container?.has?.(NotificationManager) === true
      ? this.container.make<NotificationManager>(NotificationManager)
      : undefined

    return fromContainer ?? NotificationManager.getInstance() ?? NotificationManager.create()
  }

  /** The translation catalogue, when one is bound. */
  private translator (): TranslatorLike | undefined {
    return this.container?.has?.('i18n') === true ? this.container.make<TranslatorLike>('i18n') : undefined
  }

  /** The logger, when one is bound. */
  private logger (): ILogger | undefined {
    return this.container?.has?.('logger') === true ? this.container.make<ILogger>('logger') : undefined
  }
}
