import { render, TranslatorLike } from './render'
import { NoticeRegistry } from './NoticeRegistry'
import { NotificationManager } from './NotificationManager'
import { NotificationConfigurationError } from './errors/NotificationError'
import { DEFAULT_CHANNEL, DELIVERY_JOB } from './constants'
import { IBlueprint, IContainer, ILogger } from '@stone-js/core'
import {
  DeliveryOutcome, NoticeContent, NoticeContentInput, NoticeDeclaration, NotificationReceipt,
  NotificationsConfig, NotifyOptions, Recipient, RecipientInput, RenderedNotification
} from './declarations'

/** The shape this module needs from a queue, duck-typed so `@stone-js/queue` is never imported. */
export interface QueueLike {
  dispatch: <T>(name: string, payload: T, options?: Record<string, unknown>) => Promise<string>
  later?: <T>(delay: number, name: string, payload: T, options?: Record<string, unknown>) => Promise<string>
}

/** The shape this module needs from a cache store, for deduplication only. */
export interface CacheLike {
  add: <T>(key: string, value: T, options?: Record<string, unknown>) => Promise<boolean>
}

/** The shape this module needs from a cache manager, to reach a named store. */
export interface CacheManagerLike {
  store: (name?: string) => CacheLike
}

/** The shape this module needs from an event bus, to announce what it delivered. */
export interface EventBusLike {
  emit: <T>(name: string, payload?: T, options?: Record<string, unknown>) => Promise<void>
}

/** What a queued delivery carries. Resolved and rendered already: a worker guesses nothing. */
export interface DeliveryPayload {
  recipient: Recipient
  template: string
  params: Record<string, unknown>
  locale: string
  channels: string[]
  /** The notice that produced it, when one did, so the worker asks the same class for the content. */
  notice?: string
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
    if (await this.alreadySent(template, options.dedupe)) {
      return { queued: false, duplicate: true, deliveries: [] }
    }

    const declaration = this.notices().declaration(template)
    const recipients = await this.resolveAll([to].flat())
    const channels = options.channels ?? declaration?.channels ?? this.options().default ?? [DEFAULT_CHANNEL]

    this.warnOnceAboutTheDefault(channels)

    const queue = this.queue(options)

    if (queue !== undefined) {
      await Promise.all(recipients.map(async (recipient) => {
        await this.enqueue(queue, recipient, template, params, channels, options, declaration)
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
        notice: declaration?.name,
        locale: this.localeFor(recipient, options)
      }))
    }

    return { queued: false, deliveries }
  }

  /**
   * Deliver what a notice says about a domain event.
   *
   * The entry the event subscription calls, and the reason this module is not a service somebody has
   * to remember to call: a module emits what happened, and the notice that named that event decides
   * who learns about it. The emitting module knows nothing about any of this.
   *
   * @param name - The notice's name.
   * @param event - The domain event, as the bus delivered it.
   * @returns What happened, or that it was queued.
   */
  async deliverNotice (name: string, event: unknown): Promise<NotificationReceipt> {
    const declaration = this.notices().declaration(name)

    if (declaration === undefined) {
      // Subscribed and then removed, or renamed: worth saying, because nothing else will fail.
      this.logger()?.warn(`[@stone-js/notifications] no notice is declared as '${name}'`)
      return { queued: false, deliveries: [] }
    }

    const notice = this.notices().build(declaration)

    if (notice.recipients === undefined) {
      // The one thing a notice reacting to an event must answer: the event carries the account, and
      // only the notice knows which field that is. Without it there is nobody to tell.
      this.logger()?.error?.(
        `[@stone-js/notifications] the notice '${name}' reacts to an event and does not answer ` +
        '`recipients(event)`, so nobody can be told. Add it, or drop `on` and call the notifier.'
      )
      return { queued: false, deliveries: [] }
    }

    const dedupe = notice.dedupe === undefined ? undefined : await notice.dedupe(event)

    return await this.notify(
      await notice.recipients(event),
      name,
      (event ?? {}) as Record<string, unknown>,
      dedupe === undefined ? {} : { dedupe }
    )
  }

  /**
   * What a notice would send, without sending it.
   *
   * For a screen that shows a member of staff what a guardian is about to receive, and for a test
   * that checks a notice without a channel. It renders exactly what delivery would render, per
   * channel, which is what makes it worth having rather than approximating.
   *
   * @param to - Who it would be for.
   * @param template - The notice or template name.
   * @param params - What it needs.
   * @param options - Which channels, which language.
   * @returns One rendered message per recipient and channel.
   */
  async preview (
    to: RecipientInput | RecipientInput[],
    template: string,
    params: Record<string, unknown> = {},
    options: NotifyOptions = {}
  ): Promise<Array<{ recipient: Recipient, channel: string, message: RenderedNotification }>> {
    const declaration = this.notices().declaration(template)
    const recipients = await this.resolveAll([to].flat())
    const channels = options.channels ?? declaration?.channels ?? this.options().default ?? [DEFAULT_CHANNEL]
    const previewed: Array<{ recipient: Recipient, channel: string, message: RenderedNotification }> = []

    for (const recipient of recipients) {
      const locale = this.localeFor(recipient, options)
      const content = await this.contentFrom(declaration, params, { locale, recipient })

      for (const channel of channels) {
        previewed.push({ recipient, channel, message: this.messageFor(channel, template, params, locale, content) })
      }
    }

    return previewed
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
    const declaration = payload.notice === undefined ? undefined : this.notices().declaration(payload.notice)

    // Asked once per recipient, never once per channel: a name in the body is rendered once, and the
    // channel-specific body is chosen from what it answered.
    const content = await this.contentFrom(declaration, payload.params, {
      locale: payload.locale,
      recipient: payload.recipient
    })

    const outcomes: DeliveryOutcome[] = []

    for (const name of payload.channels) {
      const message = this.messageFor(name, payload.template, payload.params, payload.locale, content)
      const outcome = await this.sendOn(manager, name, message, payload.recipient)

      outcomes.push(outcome)
      await this.announce(outcome, payload)
    }

    return outcomes
  }

  /**
   * What the notice says, for this person, or nothing when there is no notice.
   *
   * Failing here must not fail the delivery: a notice is application code, and application code
   * throws. The message then falls back to the template path, which at worst renders the key, and
   * the failure is named rather than swallowed.
   *
   * @param declaration - The notice, when one is declared.
   * @param params - The event or params it is given.
   * @param context - Who it is for, and in which language.
   * @returns The content, or nothing.
   */
  private async contentFrom (
    declaration: NoticeDeclaration | undefined,
    params: Record<string, unknown>,
    context: { locale: string, recipient: Recipient }
  ): Promise<NoticeContentInput | undefined> {
    if (declaration === undefined) { return undefined }

    try {
      return await this.notices().build(declaration).notify(params, context)
    } catch (error: any) {
      this.logger()?.error?.(`[@stone-js/notifications] the notice '${declaration.name}' threw`, {
        reason: error?.message
      })
      return undefined
    }
  }

  /**
   * The message one channel receives.
   *
   * A notice's content wins, per channel, because that is the whole reason it returns a map: a text
   * message is not an email, one having a subject and room to explain and the other a hundred and
   * sixty characters. Failing that, the template path renders it.
   *
   * @param channel - The channel about to send.
   * @param template - The notice or template name.
   * @param params - What it was given.
   * @param locale - The recipient's language.
   * @param content - What the notice said, if anything.
   * @returns The rendered message.
   */
  private messageFor (
    channel: string,
    template: string,
    params: Record<string, unknown>,
    locale: string,
    content?: NoticeContentInput
  ): RenderedNotification {
    const chosen = this.contentFor(channel, content)

    if (chosen !== undefined) {
      return { template, params, locale, subject: chosen.subject ?? template, body: chosen.body }
    }

    return render({
      template,
      params,
      locale,
      templates: this.options().templates,
      translator: this.translator()
    })
  }

  /**
   * The content for one channel, out of what a notice returned.
   *
   * Three shapes, all useful: a map keyed by channel, one content for every channel, or a bare
   * string. A map that names no content for this channel falls through to the template path rather
   * than sending an empty body.
   *
   * @param channel - The channel about to send.
   * @param content - What the notice said.
   * @returns The content, or nothing.
   */
  private contentFor (channel: string, content?: NoticeContentInput): NoticeContent | undefined {
    if (content === undefined) { return undefined }
    if (typeof content === 'string') { return { body: content } }
    if (typeof (content as NoticeContent).body === 'string') { return content as NoticeContent }

    const forChannel = (content as Record<string, NoticeContent | string>)[channel]

    if (forChannel === undefined) { return undefined }

    return typeof forChannel === 'string' ? { body: forChannel } : forChannel
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
    options: NotifyOptions,
    declaration?: NoticeDeclaration
  ): Promise<void> {
    const payload: DeliveryPayload = {
      recipient,
      template,
      params,
      channels,
      notice: declaration?.name,
      locale: this.localeFor(recipient, options)
    }

    const settings = this.options()
    const jobOptions = {
      ...(settings.queue !== undefined ? { queue: settings.queue } : {}),
      ...(settings.attempts !== undefined ? { attempts: settings.attempts } : {})
    }

    try {
      // A delayed delivery is the queue's own capability, so it is asked rather than reimplemented:
      // a timer held in a process that a cold start can end is not a reminder.
      if (options.delay !== undefined && queue.later !== undefined) {
        await queue.later(options.delay, DELIVERY_JOB, payload, jobOptions)
      } else {
        if (options.delay !== undefined) {
          this.logger()?.warn(
            '[@stone-js/notifications] a delay was asked for and this queue cannot defer, so the ' +
            'notification goes out now.',
            { template, delay: options.delay }
          )
        }
        await queue.dispatch(DELIVERY_JOB, payload, jobOptions)
      }
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

  /**
   * Whether this exact occurrence has already gone out.
   *
   * The answer to the most common production failure of any notification system: the same message
   * twice, because a queue is at-least-once, because a retry half succeeded, or because two events
   * describe one fact. Keys live in `@stone-js/cache`, so the store is the one the application
   * already chose and this module stores nothing of its own.
   *
   * `add` is the atomic set-if-absent every store implements, which is what makes this a claim rather
   * than a read followed by a hopeful write.
   *
   * @param template - The notice or template name, so two notices cannot collide on one key.
   * @param key - What makes this occurrence unique, when anything does.
   * @returns True when it was already sent.
   */
  private async alreadySent (template: string, key?: string): Promise<boolean> {
    if (key === undefined) { return false }

    const cache = this.cache()

    if (cache === undefined) {
      // Silently sending twice is exactly what this exists to prevent, so the absence is named.
      this.warnOnce('dedupe',
        '[@stone-js/notifications] a notification asked to be sent once and no cache is enabled to ' +
        'remember it, so a repeat cannot be recognised. Enable @stone-js/cache.'
      )
      return false
    }

    const ttl = this.options().dedupe?.ttl ?? 86_400

    try {
      const claimed = await cache.add(`notifications:${template}:${key}`, 1, { ttl })

      if (!claimed) {
        this.logger()?.info?.('[@stone-js/notifications] a repeated notification was dropped', { template })
      }

      return !claimed
    } catch (error: any) {
      // A cache that cannot answer must not stop a notification: better one duplicate than a message
      // nobody receives. Named, because a deduplication that quietly stopped working is worth seeing.
      this.logger()?.warn('[@stone-js/notifications] the deduplication store could not answer', {
        template,
        reason: error?.message
      })
      return false
    }
  }

  /**
   * Announce one delivery on the event bus.
   *
   * How an application keeps a delivery ledger without this module owning one. "Why did they never
   * receive it" is the question a notification system exists to answer, and the answer belongs in
   * whatever the application already queries: it listens, and writes what it needs.
   *
   * @param outcome - What the channel answered.
   * @param payload - What was being delivered.
   */
  private async announce (outcome: DeliveryOutcome, payload: DeliveryPayload): Promise<void> {
    if (this.options().announce === false) { return }

    const bus = this.bus()

    if (bus === undefined) { return }

    try {
      await bus.emit(outcome.status === 'sent' ? 'notification.delivered' : 'notification.failed', {
        template: payload.template,
        notice: payload.notice,
        channel: outcome.channel,
        status: outcome.status,
        retryable: outcome.retryable,
        reason: outcome.reason,
        // The recipient's id, never their address: this leaves the process, and an address in an
        // event is an address in every log that event passes through.
        recipientId: payload.recipient.id,
        locale: payload.locale
      })
    } catch (error: any) {
      // Announcing is a courtesy to whoever is listening, and it must not undo a delivery that
      // already happened.
      this.logger()?.warn('[@stone-js/notifications] a delivery could not be announced', {
        reason: error?.message
      })
    }
  }

  /** Say something once per notifier, so a standing condition is stated rather than repeated. */
  private warnOnce (topic: string, message: string): void {
    if (this.said.has(topic)) { return }

    this.said.add(topic)
    this.logger()?.warn(message)
  }

  /** What has already been said. */
  private readonly said = new Set<string>()

  /** The notice registry, built for this event like everything else. */
  private notices (): NoticeRegistry {
    this.registry = this.registry ?? new NoticeRegistry({ blueprint: this.blueprint, container: this.container })

    return this.registry
  }

  /** The registry, once. */
  private registry?: NoticeRegistry

  /** The cache store deduplication is remembered in, when one is bound. */
  private cache (): CacheLike | undefined {
    const name = this.options().dedupe?.store

    if (this.container?.has?.('cacheManager') === true) {
      return this.container.make<CacheManagerLike>('cacheManager').store(name)
    }

    return this.container?.has?.('cache') === true ? this.container.make<CacheLike>('cache') : undefined
  }

  /** The event bus, when one is bound. */
  private bus (): EventBusLike | undefined {
    return this.container?.has?.('eventBus') === true
      ? this.container.make<EventBusLike>('eventBus')
      : undefined
  }

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
