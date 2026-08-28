import { Notifier } from '../src/Notifier'
import { DELIVERY_JOB } from '../src/constants'
import { NotificationManager } from '../src/NotificationManager'
import { DeliveryOutcome, Channel, Recipient, RenderedNotification } from '../src/declarations'

/** A channel that records what it was handed and answers what the test wants. */
const recordingChannel = (name: string, outcome: DeliveryOutcome = { status: 'sent' }): Channel & {
  sent: Array<{ message: RenderedNotification, recipient: Recipient }>
} => {
  const sent: Array<{ message: RenderedNotification, recipient: Recipient }> = []

  return {
    name,
    sent,
    send: async (message, recipient) => {
      sent.push({ message, recipient })
      return outcome
    }
  }
}

const notifierWith = (options: {
  config?: Record<string, unknown>
  channels?: Channel[]
  queue?: { dispatch: (name: string, payload: unknown, opts?: unknown) => Promise<string> }
  i18n?: { t: (key: string, options?: Record<string, unknown>) => string }
} = {}): { notifier: Notifier, warnings: any[], errors: any[], manager: NotificationManager } => {
  const warnings: any[] = []
  const errors: any[] = []
  const manager = NotificationManager.create()

  for (const channel of options.channels ?? []) { manager.register(channel) }

  const bound: Record<string, unknown> = {
    logger: {
      warn: (...args: any[]) => warnings.push(args),
      error: (...args: any[]) => errors.push(args),
      info: () => {},
      debug: () => {}
    },
    ...(options.queue !== undefined ? { queue: options.queue } : {}),
    ...(options.i18n !== undefined ? { i18n: options.i18n } : {})
  }

  const notifier = new Notifier({
    blueprint: {
      get: (key: string, fallback?: unknown) => (
        key === 'stone.notifications' ? (options.config ?? {}) : fallback
      )
    } as any,
    container: {
      has: (key: unknown) => key === NotificationManager || (typeof key === 'string' && key in bound),
      make: (key: unknown) => (key === NotificationManager ? manager : bound[key as string])
    } as any
  })

  return { notifier, warnings, errors, manager }
}

describe('decide now, deliver later', () => {
  it('hands the delivery to the queue and answers at once', async () => {
    // The shape this module is built around. Deciding who learns what is fast; reaching a mail
    // provider is not, and a request that waits for one times out on the endpoint the user watches.
    const dispatched: any[] = []
    const { notifier } = notifierWith({
      config: { default: ['smtp'] },
      queue: { dispatch: async (name, payload, opts) => { dispatched.push({ name, payload, opts }); return 'job-1' } }
    })

    const receipt = await notifier.notify({ id: 'u1', email: 'a@x.test' }, 'welcome', { name: 'Alice' })

    expect(receipt).toEqual({ queued: true, deliveries: [] })
    expect(dispatched).toHaveLength(1)
    expect(dispatched[0].name).toBe(DELIVERY_JOB)
  })

  it('queues the key and its params, never a rendered body', async () => {
    // Two reasons, and both are lessons. A message queued before a translation is fixed goes out
    // fixed. And a queue dump holds no message bodies, so what was not copied does not have to be
    // erased.
    const dispatched: any[] = []
    const { notifier } = notifierWith({
      config: { templates: { welcome: 'Hello {{ name }}' } },
      queue: { dispatch: async (_n, payload) => { dispatched.push(payload); return 'job-1' } }
    })

    await notifier.notify({ id: 'u1' }, 'welcome', { name: 'Alice' })

    expect(dispatched[0]).toMatchObject({ template: 'welcome', params: { name: 'Alice' } })
    expect(JSON.stringify(dispatched[0])).not.toContain('Hello Alice')
  })

  it('sends here and now when the caller asks for it', async () => {
    const channel = recordingChannel('log')
    const { notifier } = notifierWith({
      channels: [channel],
      queue: { dispatch: async () => 'job-1' }
    })

    const receipt = await notifier.notify({ id: 'u1' }, 'welcome', {}, { channels: ['log'], inline: true })

    expect(receipt.queued).toBe(false)
    expect(channel.sent).toHaveLength(1)
  })

  it('sends in the request when no queue is enabled', async () => {
    // Zero-config has to work. An application with no queue still notifies people.
    const channel = recordingChannel('log')
    const { notifier } = notifierWith({ channels: [channel], config: { default: ['log'] } })

    const receipt = await notifier.notify({ id: 'u1' }, 'welcome')

    expect(receipt.queued).toBe(false)
    expect(channel.sent).toHaveLength(1)
  })

  it('says so when queueing was asked for and there is no queue', async () => {
    const channel = recordingChannel('log')
    const { notifier, warnings } = notifierWith({
      channels: [channel],
      config: { default: ['log'], dispatch: 'queue' }
    })

    await notifier.notify({ id: 'u1' }, 'welcome')

    expect(warnings.some(([m]) => String(m).includes('no queue is enabled'))).toBe(true)
  })

  it('does not undo the operation that caused it when the queue refuses the work', async () => {
    // A notification is almost always a side effect of something that already succeeded. Failing
    // that operation because a queue was down would undo work that was correct.
    const { notifier, errors } = notifierWith({
      config: { default: ['log'] },
      queue: { dispatch: async () => { throw new Error('the queue is down') } }
    })

    await expect(notifier.notify({ id: 'u1' }, 'welcome')).resolves.toMatchObject({ queued: true })
    expect(errors.some(([m]) => String(m).includes('could not be queued'))).toBe(true)
  })
})

describe('who a notification is for', () => {
  it('takes a recipient as it stands', async () => {
    const channel = recordingChannel('log')
    const { notifier } = notifierWith({ channels: [channel], config: { default: ['log'] } })

    await notifier.notify({ id: 'u1', email: 'a@x.test' }, 'welcome')

    expect(channel.sent[0].recipient.email).toBe('a@x.test')
  })

  it('resolves an id through the application own directory, at send time', async () => {
    // The address is read when the message goes out rather than copied into it, so erasing an account
    // closes the channel immediately and a changed address is the one written to.
    const channel = recordingChannel('log')
    const { notifier } = notifierWith({
      channels: [channel],
      config: {
        default: ['log'],
        recipients: async (id: string) => ({ id, email: `${id}@x.test`, locale: 'fr' })
      }
    })

    await notifier.notify('u1', 'welcome')

    expect(channel.sent[0].recipient).toMatchObject({ id: 'u1', email: 'u1@x.test' })
  })

  it('tells several people, each resolved on their own', async () => {
    const channel = recordingChannel('log')
    const { notifier } = notifierWith({
      channels: [channel],
      config: { default: ['log'], recipients: async (id: string) => ({ id }) }
    })

    await notifier.notify(['u1', { id: 'u2' }], 'welcome')

    expect(channel.sent.map(({ recipient }) => recipient.id)).toEqual(['u1', 'u2'])
  })

  it('says so when an id arrives and nothing can turn one into a person', async () => {
    const channel = recordingChannel('log')
    const { notifier, warnings } = notifierWith({ channels: [channel], config: { default: ['log'] } })

    await notifier.notify('u1', 'welcome')

    expect(channel.sent).toHaveLength(0)
    expect(warnings.some(([m]) => String(m).includes('turn an id into a person'))).toBe(true)
  })

  it('drops an id nobody recognises, and says which', async () => {
    const channel = recordingChannel('log')
    const { notifier, warnings } = notifierWith({
      channels: [channel],
      config: { default: ['log'], recipients: async () => undefined }
    })

    await notifier.notify('ghost', 'welcome')

    expect(channel.sent).toHaveLength(0)
    expect(warnings.some(([, ctx]) => ctx?.id === 'ghost')).toBe(true)
  })
})

describe('the language a message is written in', () => {
  it('is the recipient own, not the request one', async () => {
    // A French-speaking guardian invited by an English-speaking member of staff reads French. Getting
    // this backwards is invisible in every test written by one person in one language.
    const channel = recordingChannel('log')
    const { notifier } = notifierWith({
      channels: [channel],
      config: {
        default: ['log'],
        templates: { welcome: (_params: any, locale: string) => ({ body: `body in ${locale}` }) }
      }
    })

    await notifier.notify({ id: 'u1', locale: 'fr' }, 'welcome')

    expect(channel.sent[0].message.locale).toBe('fr')
    expect(channel.sent[0].message.body).toBe('body in fr')
  })

  it('can be forced, for the few messages that are about the sender context', async () => {
    const channel = recordingChannel('log')
    const { notifier } = notifierWith({ channels: [channel], config: { default: ['log'] } })

    await notifier.notify({ id: 'u1', locale: 'fr' }, 'welcome', {}, { locale: 'en' })

    expect(channel.sent[0].message.locale).toBe('en')
  })
})

describe('what happens when a channel does not deliver', () => {
  it('reports every channel outcome rather than raising', async () => {
    const ok = recordingChannel('a')
    const bad = recordingChannel('b', { status: 'failed', retryable: true, reason: 'provider down' })
    const { notifier } = notifierWith({ channels: [ok, bad], config: { default: ['a', 'b'] } })

    const receipt = await notifier.notify({ id: 'u1' }, 'welcome')

    expect(receipt.deliveries).toEqual([
      { status: 'sent', channel: 'a' },
      { status: 'failed', retryable: true, reason: 'provider down', channel: 'b' }
    ])
  })

  it('keeps going on the other channels when one fails', async () => {
    // Reaching a person is the point, and the second channel exists precisely for when the first
    // does not work.
    const bad = recordingChannel('a', { status: 'unreachable', retryable: false })
    const ok = recordingChannel('b')
    const { notifier } = notifierWith({ channels: [bad, ok], config: { default: ['a', 'b'] } })

    await notifier.notify({ id: 'u1' }, 'welcome')

    expect(ok.sent).toHaveLength(1)
  })

  it('treats a channel that throws as retryable, and never lets the throw out', async () => {
    // A throw is an adapter bug rather than a verdict. Burying a channel's whole traffic the day a
    // provider client changes its error shapes would be worse than one retry too many.
    const throwing: any = { name: 'a', send: async () => { throw new Error('undefined is not a function') } }
    const { notifier, errors } = notifierWith({ channels: [throwing], config: { default: ['a'] } })

    const receipt = await notifier.notify({ id: 'u1' }, 'welcome')

    expect(receipt.deliveries[0]).toMatchObject({ status: 'failed', retryable: true, channel: 'a' })
    expect(errors.some(([m]) => String(m).includes('threw'))).toBe(true)
  })

  it('logs a channel that did not deliver, with why', async () => {
    const bad = recordingChannel('a', { status: 'unreachable', retryable: false, reason: 'no email address' })
    const { notifier, warnings } = notifierWith({ channels: [bad], config: { default: ['a'] } })

    await notifier.notify({ id: 'u1' }, 'welcome')

    expect(warnings.some(([, ctx]) => ctx?.reason === 'no email address')).toBe(true)
  })
})

describe('the default that reaches nobody', () => {
  it('says once that notifications are going to the log', async () => {
    // A module that delivered nothing while looking like one that delivers is the failure this
    // warning exists to prevent.
    const channel = recordingChannel('log')
    const { notifier, warnings } = notifierWith({ channels: [channel] })

    await notifier.notify({ id: 'u1' }, 'welcome')
    await notifier.notify({ id: 'u2' }, 'welcome')

    const said = warnings.filter(([m]) => String(m).includes('reaches nobody'))

    expect(said).toHaveLength(1)
  })

  it('says nothing once a channel is configured', async () => {
    const channel = recordingChannel('smtp')
    const { notifier, warnings } = notifierWith({
      channels: [channel],
      config: { default: ['smtp'], channels: [{ name: 'smtp', driver: 'smtp' }] }
    })

    await notifier.notify({ id: 'u1' }, 'welcome')

    expect(warnings.filter(([m]) => String(m).includes('reaches nobody'))).toHaveLength(0)
  })

  it('says nothing when the log channel was configured on purpose', async () => {
    const channel = recordingChannel('log')
    const { notifier, warnings } = notifierWith({
      channels: [channel],
      config: { default: ['log'], channels: [{ name: 'log', driver: 'log' }] }
    })

    await notifier.notify({ id: 'u1' }, 'welcome')

    expect(warnings.filter(([m]) => String(m).includes('reaches nobody'))).toHaveLength(0)
  })
})

describe('with no channel registry in the container', () => {
  it('still answers, because a notifier reaches for what it can find', async () => {
    // A notifier built outside a wired container falls back to the published registry, then to an
    // empty one. Nothing is delivered, and the failure is named rather than thrown.
    const notifier = new Notifier({
      blueprint: { get: (k: string, f?: unknown) => (k === 'stone.notifications' ? { default: ['log'] } : f) } as any
    })

    const receipt = await notifier.notify({ id: 'u1' }, 'welcome')

    expect(receipt.deliveries[0]).toMatchObject({ status: 'failed', retryable: false, channel: 'log' })
  })

  it('takes the registry that was published when there is one', async () => {
    const channel = recordingChannel('log')
    const manager = NotificationManager.create().register(channel)

    NotificationManager.setInstance(manager)

    const notifier = new Notifier({
      blueprint: { get: (k: string, f?: unknown) => (k === 'stone.notifications' ? { default: ['log'] } : f) } as any
    })

    await notifier.notify({ id: 'u1' }, 'welcome')

    expect(channel.sent).toHaveLength(1)

    NotificationManager.setInstance(undefined)
  })

  it('falls back to the configured locale when the recipient names none', async () => {
    const channel = recordingChannel('log')
    const notifier = new Notifier({
      blueprint: {
        get: (k: string, f?: unknown) => {
          if (k === 'stone.notifications') { return { default: ['log'] } }
          if (k === 'stone.i18n.locale') { return 'fr' }
          return f
        }
      } as any,
      container: {
        has: (k: unknown) => k === NotificationManager,
        make: () => NotificationManager.create().register(channel)
      } as any
    })

    await notifier.notify({ id: 'u1' }, 'welcome')

    expect(channel.sent[0].message.locale).toBe('fr')
  })
})
