import { Notifier } from '../src/Notifier'
import { DELIVERY_JOB } from '../src/constants'
import { NotificationManager } from '../src/NotificationManager'
import { DeliveryOutcome, NotificationChannel, Recipient, RenderedNotification } from '../src/declarations'

const recordingChannel = (name: string, outcome: DeliveryOutcome = { status: 'sent' }): NotificationChannel & {
  sent: Array<{ message: RenderedNotification, recipient: Recipient }>
} => {
  const sent: Array<{ message: RenderedNotification, recipient: Recipient }> = []

  return { name, sent, send: async (message, recipient) => { sent.push({ message, recipient }); return outcome } }
}

/** A cache with the one operation deduplication needs: an atomic claim. */
const claimingCache = (): { add: (key: string, value: unknown, options?: any) => Promise<boolean>, claimed: string[] } => {
  const claimed: string[] = []

  return {
    claimed,
    add: async (key: string) => {
      if (claimed.includes(key)) { return false }
      claimed.push(key)
      return true
    }
  }
}

const notifierWith = (options: {
  config?: Record<string, unknown>
  channels?: NotificationChannel[]
  bound?: Record<string, unknown>
} = {}): { notifier: Notifier, warnings: any[], errors: any[], infos: any[] } => {
  const warnings: any[] = []
  const errors: any[] = []
  const infos: any[] = []
  const manager = NotificationManager.create()

  for (const channel of options.channels ?? []) { manager.register(channel) }

  const bound: Record<string, unknown> = {
    logger: {
      warn: (...a: any[]) => warnings.push(a),
      error: (...a: any[]) => errors.push(a),
      info: (...a: any[]) => infos.push(a),
      debug: () => {}
    },
    ...options.bound
  }

  const notifier = new Notifier({
    blueprint: {
      get: (key: string, fallback?: unknown) => (key === 'stone.notifications' ? (options.config ?? {}) : fallback)
    } as any,
    container: {
      has: (key: unknown) => key === NotificationManager || (typeof key === 'string' && key in bound),
      make: (key: unknown) => (key === NotificationManager ? manager : bound[key as string]),
      resolve: (target: any) => new target({})
    } as any
  })

  return { notifier, warnings, errors, infos }
}

describe('the same message twice', () => {
  it('is sent once when the occurrence names itself', async () => {
    // The most common production failure of any notification system: a queue is at-least-once, a
    // retry half succeeded, or two events describe one fact.
    const cache = claimingCache()
    const channel = recordingChannel('a')
    const { notifier } = notifierWith({ channels: [channel], config: { default: ['a'] }, bound: { cache } })

    const first = await notifier.notify({ id: 'u1' }, 'welcome', {}, { dedupe: 'u1:welcome' })
    const second = await notifier.notify({ id: 'u1' }, 'welcome', {}, { dedupe: 'u1:welcome' })

    expect(first.duplicate).toBeUndefined()
    expect(second.duplicate).toBe(true)
    expect(channel.sent).toHaveLength(1)
  })

  it('files the key under the notice, so two notices cannot collide', async () => {
    const cache = claimingCache()
    const { notifier } = notifierWith({
      channels: [recordingChannel('a')],
      config: { default: ['a'] },
      bound: { cache }
    })

    await notifier.notify({ id: 'u1' }, 'welcome', {}, { dedupe: 'u1' })
    const other = await notifier.notify({ id: 'u1' }, 'goodbye', {}, { dedupe: 'u1' })

    expect(other.duplicate).toBeUndefined()
    expect(cache.claimed).toEqual(['notifications:welcome:u1', 'notifications:goodbye:u1'])
  })

  it('is claimed atomically, not read and then written', async () => {
    // Two concurrent attempts must not both decide they are the first. `add` is the set-if-absent
    // every store implements, which is what makes this a claim rather than a hopeful write.
    const cache = claimingCache()
    const channel = recordingChannel('a')
    const { notifier } = notifierWith({ channels: [channel], config: { default: ['a'] }, bound: { cache } })

    await Promise.all([
      notifier.notify({ id: 'u1' }, 'welcome', {}, { dedupe: 'k' }),
      notifier.notify({ id: 'u1' }, 'welcome', {}, { dedupe: 'k' })
    ])

    expect(channel.sent).toHaveLength(1)
  })

  it('is remembered in the store the application named', async () => {
    const stores: string[] = []
    const cache = claimingCache()
    const { notifier } = notifierWith({
      channels: [recordingChannel('a')],
      config: { default: ['a'], dedupe: { store: 'shared', ttl: 60 } },
      bound: { cacheManager: { store: (name?: string) => { stores.push(String(name)); return cache } } }
    })

    await notifier.notify({ id: 'u1' }, 'welcome', {}, { dedupe: 'k' })

    expect(stores).toEqual(['shared'])
  })

  it('says so when nothing can remember, rather than sending twice in silence', async () => {
    const channel = recordingChannel('a')
    const { notifier, warnings } = notifierWith({ channels: [channel], config: { default: ['a'] } })

    await notifier.notify({ id: 'u1' }, 'welcome', {}, { dedupe: 'k' })
    await notifier.notify({ id: 'u1' }, 'welcome', {}, { dedupe: 'k' })

    expect(channel.sent).toHaveLength(2)
    expect(warnings.filter(([m]) => String(m).includes('no cache is enabled'))).toHaveLength(1)
  })

  it('sends rather than blocks when the store cannot answer', async () => {
    // Better one duplicate than a message nobody receives. Named, because a deduplication that
    // quietly stopped working is worth seeing.
    const channel = recordingChannel('a')
    const { notifier, warnings } = notifierWith({
      channels: [channel],
      config: { default: ['a'] },
      bound: { cache: { add: async () => { throw new Error('the store is down') } } }
    })

    await notifier.notify({ id: 'u1' }, 'welcome', {}, { dedupe: 'k' })

    expect(channel.sent).toHaveLength(1)
    expect(warnings.some(([m]) => String(m).includes('could not answer'))).toBe(true)
  })

  it('is what a notice states about its own occurrence', async () => {
    const cache = claimingCache()
    const channel = recordingChannel('a')

    class Once {
      recipients (event: any): any { return { id: event.userId } }
      dedupe (event: any): string { return String(event.factId) }
      notify (): any { return { body: 'Told once.' } }
    }

    const { notifier } = notifierWith({
      channels: [channel],
      config: { notices: [{ name: 'once', on: 'e.v1', channels: ['a'], module: Once, isClass: true }] },
      bound: { cache }
    })

    await notifier.deliverNotice('once', { userId: 'u1', factId: 'f1' })
    await notifier.deliverNotice('once', { userId: 'u1', factId: 'f1' })

    expect(channel.sent).toHaveLength(1)
    expect(cache.claimed).toEqual(['notifications:once:f1'])
  })
})

describe('waiting before delivering', () => {
  it('asks the queue to defer, rather than holding a timer', async () => {
    // A timer held in a process a cold start can end is not a reminder.
    const deferred: any[] = []
    const { notifier } = notifierWith({
      config: { default: ['a'] },
      bound: {
        queue: {
          dispatch: async () => 'now',
          later: async (delay: number, name: string, payload: unknown) => { deferred.push({ delay, name, payload }); return 'later' }
        }
      }
    })

    await notifier.notify({ id: 'u1' }, 'reminder', {}, { delay: 86_400 })

    expect(deferred[0]).toMatchObject({ delay: 86_400, name: DELIVERY_JOB })
  })

  it('sends now and says so when the queue cannot defer', async () => {
    const dispatched: any[] = []
    const { notifier, warnings } = notifierWith({
      config: { default: ['a'] },
      bound: { queue: { dispatch: async (name: string) => { dispatched.push(name); return 'now' } } }
    })

    await notifier.notify({ id: 'u1' }, 'reminder', {}, { delay: 60 })

    expect(dispatched).toEqual([DELIVERY_JOB])
    expect(warnings.some(([m]) => String(m).includes('cannot defer'))).toBe(true)
  })
})

describe('announcing what was delivered', () => {
  it('emits a delivered event, so an application can keep its own ledger', async () => {
    // "Why did they never receive it" is the question a notification system exists to answer, and the
    // answer belongs in whatever the application already queries. This module records nothing.
    const emitted: any[] = []
    const { notifier } = notifierWith({
      channels: [recordingChannel('a')],
      config: { default: ['a'] },
      bound: { eventBus: { emit: async (name: string, payload: unknown) => { emitted.push({ name, payload }) } } }
    })

    await notifier.notify({ id: 'u1', locale: 'fr' }, 'welcome')

    expect(emitted[0].name).toBe('notification.delivered')
    expect(emitted[0].payload).toMatchObject({ template: 'welcome', channel: 'a', status: 'sent', recipientId: 'u1', locale: 'fr' })
  })

  it('emits a failed event, with why and whether it is worth retrying', async () => {
    const emitted: any[] = []
    const { notifier } = notifierWith({
      channels: [recordingChannel('a', { status: 'failed', retryable: true, reason: 'provider down' })],
      config: { default: ['a'] },
      bound: { eventBus: { emit: async (name: string, payload: unknown) => { emitted.push({ name, payload }) } } }
    })

    await notifier.notify({ id: 'u1' }, 'welcome')

    expect(emitted[0].name).toBe('notification.failed')
    expect(emitted[0].payload).toMatchObject({ status: 'failed', retryable: true, reason: 'provider down' })
  })

  it('carries the recipient id and never their address', async () => {
    // This leaves the process, and an address in an event is an address in every log that event
    // passes through.
    const emitted: any[] = []
    const { notifier } = notifierWith({
      channels: [recordingChannel('a')],
      config: { default: ['a'] },
      bound: { eventBus: { emit: async (_n: string, payload: unknown) => { emitted.push(payload) } } }
    })

    await notifier.notify({ id: 'u1', email: 'someone@example.test' }, 'welcome')

    expect(JSON.stringify(emitted[0])).not.toContain('someone@example.test')
  })

  it('says nothing when the application would rather it did not', async () => {
    const emitted: any[] = []
    const { notifier } = notifierWith({
      channels: [recordingChannel('a')],
      config: { default: ['a'], announce: false },
      bound: { eventBus: { emit: async () => { emitted.push(1) } } }
    })

    await notifier.notify({ id: 'u1' }, 'welcome')

    expect(emitted).toHaveLength(0)
  })

  it('does not undo a delivery that already happened when announcing fails', async () => {
    const channel = recordingChannel('a')
    const { notifier, warnings } = notifierWith({
      channels: [channel],
      config: { default: ['a'] },
      bound: { eventBus: { emit: async () => { throw new Error('the bus is down') } } }
    })

    await expect(notifier.notify({ id: 'u1' }, 'welcome')).resolves.toMatchObject({ queued: false })
    expect(channel.sent).toHaveLength(1)
    expect(warnings.some(([m]) => String(m).includes('could not be announced'))).toBe(true)
  })
})

describe('seeing what would be sent', () => {
  it('renders exactly what delivery would render, and sends nothing', async () => {
    // For a screen that shows a member of staff what a guardian is about to receive, and for a test
    // that checks a notice without a channel.
    class ConsentNeeded {
      notify (event: any, context: any): any {
        return {
          smtp: { subject: 'Consent', body: `For ${String(event.child)} in ${String(context.locale)}` },
          'in-app': { body: 'Consent needed' }
        }
      }
    }

    const channel = recordingChannel('smtp')
    const { notifier } = notifierWith({
      channels: [channel],
      config: { notices: [{ name: 'consent', channels: ['smtp', 'in-app'], module: ConsentNeeded, isClass: true }] }
    })

    const previewed = await notifier.preview({ id: 'u1', locale: 'fr' }, 'consent', { child: 'Lea' })

    expect(channel.sent).toHaveLength(0)
    expect(previewed).toHaveLength(2)
    expect(previewed[0]).toMatchObject({ channel: 'smtp' })
    expect(previewed[0].message).toMatchObject({ subject: 'Consent', body: 'For Lea in fr' })
    expect(previewed[1].message.body).toBe('Consent needed')
  })

  it('previews a template as well as a notice', async () => {
    const { notifier } = notifierWith({
      config: { default: ['a'], templates: { welcome: 'Hello {{ name }}.' } }
    })

    const previewed = await notifier.preview({ id: 'u1' }, 'welcome', { name: 'Alice' })

    expect(previewed[0].message.body).toBe('Hello Alice.')
  })

  it('previews for every recipient it is given', async () => {
    const { notifier } = notifierWith({
      config: { default: ['a'], recipients: async (id: string) => ({ id, locale: 'en' }) }
    })

    const previewed = await notifier.preview(['u1', 'u2'], 'welcome')

    expect(previewed.map(({ recipient }) => recipient.id)).toEqual(['u1', 'u2'])
  })
})
