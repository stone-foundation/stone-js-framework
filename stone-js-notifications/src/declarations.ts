import { Promiseable } from '@stone-js/core'

/**
 * Who a notification is for.
 *
 * Deliberately thin, and open. This module has no idea what a person is in your application, and it
 * must not: the only thing a notification library cannot ship is your idea of a person. What it needs
 * is where to reach them, and in which language.
 */
export interface Recipient {
  /** Whatever the application calls this person. Used to address the in-app channel. */
  id?: string
  /** Where to write. */
  email?: string
  /** Where to text. */
  phone?: string
  /** Where to push. Registering and storing them is the application's business. */
  deviceTokens?: string[]
  /** The language **this person** reads, which is not the language of the request. */
  locale?: string
  /** Anything a channel of your own needs. */
  [key: string]: unknown
}

/**
 * A recipient, or the id of one.
 *
 * An id is resolved through `stone.notifications.recipients`, so an application that keeps people in
 * a vault reads the address at send time rather than copying it into a message. What is not copied
 * does not have to be erased.
 */
export type RecipientInput = Recipient | string

/** What a channel is handed: the key, the params, and the text rendered for this person. */
export interface RenderedNotification {
  /** The template key, carried through so a channel can log what it sent without the body. */
  template: string
  /** What the template was rendered with. */
  params: Record<string, unknown>
  /** A one-line subject, for the channels that have one. */
  subject: string
  /** The message itself. */
  body: string
  /** The locale it was rendered in. */
  locale: string
}

/** How a delivery ended. */
export type DeliveryStatus = 'sent' | 'failed' | 'unreachable'

/**
 * What a channel answers.
 *
 * It **answers**, and never throws, for everything it can foresee: a missing address, a provider
 * refusing, a rate limit. A channel that throws is treated as retryable, because a throw is an
 * adapter bug and burying a whole channel's traffic the day a provider client changes its errors
 * would be worse than one retry too many.
 */
export interface DeliveryOutcome {
  /** Whether it went out. */
  status: DeliveryStatus
  /**
   * Whether trying again could work.
   *
   * The distinction a channel owes its caller: a provider being down is retryable, an address that
   * does not exist never will be, and retrying it forever is how a queue fills up with work that
   * cannot succeed.
   */
  retryable?: boolean
  /** Why, in words a person reading a log can act on. */
  reason?: string
  /** The provider's own id for the message, when it gives one. */
  id?: string
  /** Which channel answered. Filled in by the notifier. */
  channel?: string
}

/**
 * A way to reach someone.
 *
 * The whole port, and it is small on purpose: a channel never decides **whether** to send. That is
 * the application's call, and an application that models consent, preferences or quiet hours makes
 * it before calling here. A channel that started deciding would be a second policy to keep in step
 * with the first.
 */
export interface NotificationChannel {
  /** The name a notification refers to it by. */
  readonly name: string
  /**
   * Send one message to one person.
   *
   * @param message - The rendered notification.
   * @param recipient - Who it is for.
   * @returns How it ended.
   */
  send: (message: RenderedNotification, recipient: Recipient) => Promise<DeliveryOutcome>
}

/** How a channel is built from what the application configured. */
export type NotificationChannelFactory = (config: ChannelConfig) => NotificationChannel

/** The channels this package ships. Any other name is one an application registered. */
export type NotificationDriver = 'log' | 'in-app' | 'smtp' | (string & {})

/** What a configured channel declares. */
export interface ChannelConfig {
  /** The name it is resolved under. */
  name: string
  /** Which driver builds it. Defaults to `log`, and ignored when `factory` is given. */
  driver?: NotificationDriver
  /**
   * Build the channel yourself, instead of naming a driver this package ships.
   *
   * This is how an application reaches a provider nobody here has heard of, and how `sms` and `push`
   * are done: they are named in the types and not implemented, because a channel that picked a vendor
   * would be wrong for everyone who chose a different one.
   *
   * It is declared here, with the other channels, rather than registered on the manager from a
   * provider: the container is rebuilt for every event, so anything registered imperatively during
   * one event is gone for the next.
   */
  factory?: NotificationChannelFactory
  /**
   * A class the container builds into a channel.
   *
   * What `@NotificationChannel('sms')` declares. Built through the container, so the channel's
   * constructor is auto-wired like any other service and can ask for whatever it needs.
   */
  module?: unknown
  /** Anything the driver needs. */
  [key: string]: unknown
}

/** Options for the SMTP channel. */
export interface SmtpChannelConfig extends ChannelConfig {
  /** A `nodemailer` transport, or the options to build one. */
  transport?: unknown
  /** Where mail appears to come from. Required, because no default could be right. */
  from?: string
}

/** Options for the in-app channel. */
export interface InAppChannelConfig extends ChannelConfig {
  /** The channel to broadcast on. Defaults to `user.{id}.notifications`. */
  channelFor?: (recipient: Recipient) => string
  /** The event name clients listen for. Defaults to `notification`. */
  event?: string
}

/** A template, as the application declares it when it does not use a catalogue. */
export type TemplateInput =
  | string
  | { subject?: string, body: string }
  | ((params: Record<string, unknown>, locale: string) => { subject?: string, body: string })

/** What one call to the notifier reports back. */
export interface NotificationReceipt {
  /** True when delivery was handed to a queue rather than performed here. */
  queued: boolean
  /** What each channel answered, empty when the work was queued. */
  deliveries: DeliveryOutcome[]
}

/** What a notification says about itself, beyond the template and its params. */
export interface NotifyOptions {
  /** Which channels to use. Defaults to `stone.notifications.default`. */
  channels?: string[]
  /** Force the language, when it is not the recipient's own. Rarely right. */
  locale?: string
  /** Send here and now instead of queueing, whatever the configuration says. */
  inline?: boolean
}

/**
 * How notifications are configured (`stone.notifications.*`).
 *
 * **What this module does and does not decide.** It decides who learns what, through which channel,
 * and in which language. It never decides *whether* to send: consent, preferences, quiet hours and
 * audiences are the application's, because the rules that matter there are about its own people.
 * A framework imposing them would be wrong for the first application that has different ones.
 */
export interface NotificationsConfig {
  /** The channels this application configures. */
  channels?: ChannelConfig[]
  /**
   * The channels a notification uses when it names none.
   *
   * Defaults to `['log']`, which delivers nothing and says so on first use. That is deliberate: a
   * default that quietly sent real mail would send it from the first test run.
   */
  default?: string[]
  /**
   * How to turn an id into a person.
   *
   * The one thing this module cannot ship. Point it at whatever already knows, and the address is
   * read at send time rather than copied into a message.
   *
   * ```ts
   * recipients: async (id) => await accounts.contactFor(id)
   * ```
   */
  recipients?: (id: string) => Promiseable<Recipient | undefined>
  /**
   * Templates, for an application that does not carry a translation catalogue.
   *
   * When `@stone-js/i18n` is enabled, keys are looked up there instead, in the **recipient's**
   * locale. These are the fallback, and the override: a key found here is used as it stands.
   */
  templates?: Record<string, TemplateInput>
  /**
   * Whether delivery is handed to a queue or performed in the request.
   *
   * Defaults to `queue` when `@stone-js/queue` is enabled, and to `inline` otherwise, saying so
   * once. Queueing is what this module is shaped around: deciding and recording is fast, reaching a
   * mail provider is not, and a request that waits for one is a request that times out on a
   * function-as-a-service platform.
   */
  dispatch?: 'queue' | 'inline'
  /** The queue to dispatch on. Defaults to the application's default queue. */
  queue?: string
  /** How many times a queued delivery is retried. Defaults to what the queue does. */
  attempts?: number
}
