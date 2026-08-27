import { getBlueprint } from '@stone-js/core'
import { Notifier } from '../src/Notifier'
import { Notice } from '../src/decorators/Notice'
import { NOTICE_KEY } from '../src/decorators/constants'
import { defineNotice } from '../src/defineNotice'
import { NoticeRegistry } from '../src/NoticeRegistry'
import { NotificationManager } from '../src/NotificationManager'
import { NotificationConfigurationError } from '../src/errors/NotificationError'
import { NoticeSubscriptionsMiddleware } from '../src/middleware/NoticeSubscriptionsMiddleware'
import { DeliveryOutcome, NotificationChannel, Recipient, RenderedNotification } from '../src/declarations'

const recordingChannel = (name: string, outcome: DeliveryOutcome = { status: 'sent' }): NotificationChannel & {
  sent: Array<{ message: RenderedNotification, recipient: Recipient }>
} => {
  const sent: Array<{ message: RenderedNotification, recipient: Recipient }> = []

  return { name, sent, send: async (message, recipient) => { sent.push({ message, recipient }); return outcome } }
}

const notifierWith = (options: {
  config?: Record<string, unknown>
  channels?: NotificationChannel[]
  bound?: Record<string, unknown>
  resolve?: (target: any) => unknown
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
      resolve: options.resolve ?? ((target: any) => new target({}))
    } as any
  })

  return { notifier, warnings, errors, infos }
}

describe('declaring a notice', () => {
  it('carries metadata, and nothing else', () => {
    // The decorator says what it is; the class says what it says. There is no content option, because
    // text in a decorator is text that cannot be translated, formatted, or read off the event.
    @Notice({ name: 'consent.needed', on: 'identity.guardian.invited.v1', channels: ['smtp'] })
    class ConsentNeeded {
      notify (): any { return { body: 'Please confirm.' } }
    }

    expect(getBlueprint(ConsentNeeded)?.stone?.notifications?.notices).toEqual([
      { name: 'consent.needed', on: 'identity.guardian.invited.v1', channels: ['smtp'], module: ConsentNeeded, isClass: true }
    ])
  })

  it('says the same thing imperatively', () => {
    class ConsentNeeded { notify (): any { return { body: 'x' } } }

    expect(defineNotice(ConsentNeeded, { name: 'consent.needed', on: 'e.v1' })).toEqual({
      name: 'consent.needed',
      on: 'e.v1',
      module: ConsentNeeded,
      isClass: true
    })
  })

  it('registers the class as a service, reachable by its own name', () => {
    @Notice({ name: 'welcome' })
    class Welcome { notify (): any { return { body: 'Hi' } } }

    expect((Welcome as any)[Symbol.for('Symbol.metadata')]).toBeDefined()
    expect(getBlueprint(Welcome)?.stone?.notifications?.notices?.[0]?.name).toBe('welcome')
  })

  it('keeps its own metadata readable by another package', () => {
    // A string key by convention, so a contract or a linter can see what an application declared
    // without importing this module.
    @Notice({ name: 'welcome', on: 'account.created.v1' })
    class Welcome { notify (): any { return { body: 'Hi' } } }

    const { getMetadata } = require('@stone-js/core')

    expect(getMetadata(Welcome, NOTICE_KEY, {})).toMatchObject({ name: 'welcome', on: 'account.created.v1' })
  })
})

describe('the registry that finds a notice', () => {
  const registryWith = (notices: any[], resolve?: (t: any) => unknown): NoticeRegistry => new NoticeRegistry({
    blueprint: { get: (k: string, f?: unknown) => (k === 'stone.notifications' ? { notices } : f) } as any,
    container: { resolve: resolve ?? ((target: any) => new target({})) } as any
  })

  it('finds one by name and one by the event it reacts to', () => {
    class A { notify (): any { return { body: 'a' } } }
    const registry = registryWith([{ name: 'a', on: 'e.a.v1', module: A, isClass: true }])

    expect(registry.declaration('a')?.name).toBe('a')
    expect(registry.forEvent('e.a.v1')?.name).toBe('a')
    expect(registry.forEvent('nothing')).toBeUndefined()
  })

  it('builds a class through the container, so it gets its services', () => {
    class WithService {
      constructor (public readonly deps: any) {}
      notify (): any { return { body: 'a' } }
    }

    const registry = registryWith(
      [{ name: 'a', module: WithService, isClass: true }],
      (target: any) => new target({ i18n: 'the catalogue' })
    )

    expect((registry.build(registry.declaration('a')!) as any).deps.i18n).toBe('the catalogue')
  })

  it('takes an object that already answers notify', () => {
    const notice = { notify: () => ({ body: 'a' }) }
    const registry = registryWith([{ name: 'a', module: notice, isClass: false }])

    expect(registry.build(registry.declaration('a')!)).toBe(notice)
  })

  it('refuses a declaration with nothing to say', () => {
    const registry = registryWith([{ name: 'a' }])

    expect(() => registry.build(registry.declaration('a')!)).toThrow(NotificationConfigurationError)
    expect(() => registry.build(registry.declaration('a')!)).toThrow(/declares no module/)
  })

  it('refuses a class that does not answer notify, and says what a notice is', () => {
    class NotANotice {}
    const registry = registryWith([{ name: 'a', module: NotANotice, isClass: true }])

    expect(() => registry.build(registry.declaration('a')!)).toThrow(/notify\(event, context\)/)
  })
})

describe('what a notice says, per channel', () => {
  it('gives each channel its own body', async () => {
    // A text message is not an email: one has a subject and room to explain, the other a hundred and
    // sixty characters. One body for both is wrong for at least one of them.
    class ConsentNeeded {
      notify (): any {
        return {
          smtp: { subject: 'Your consent is needed', body: 'Please confirm for Lea.' },
          'in-app': { body: 'Consent needed' }
        }
      }
    }

    const smtp = recordingChannel('smtp')
    const inApp = recordingChannel('in-app')
    const { notifier } = notifierWith({
      channels: [smtp, inApp],
      config: { notices: [{ name: 'consent', channels: ['smtp', 'in-app'], module: ConsentNeeded, isClass: true }] }
    })

    await notifier.notify({ id: 'u1' }, 'consent')

    expect(smtp.sent[0].message).toMatchObject({ subject: 'Your consent is needed', body: 'Please confirm for Lea.' })
    expect(inApp.sent[0].message).toMatchObject({ subject: 'consent', body: 'Consent needed' })
  })

  it('takes one content for every channel, and a bare string too', async () => {
    class Single { notify (): any { return { body: 'The same everywhere.' } } }
    class Bare { notify (): any { return 'Shorter still.' } }

    const a = recordingChannel('a')
    const b = recordingChannel('b')
    const { notifier } = notifierWith({
      channels: [a, b],
      config: {
        notices: [
          { name: 'single', channels: ['a', 'b'], module: Single, isClass: true },
          { name: 'bare', channels: ['a'], module: Bare, isClass: true }
        ]
      }
    })

    await notifier.notify({ id: 'u1' }, 'single')
    await notifier.notify({ id: 'u1' }, 'bare')

    expect(a.sent[0].message.body).toBe('The same everywhere.')
    expect(b.sent[0].message.body).toBe('The same everywhere.')
    expect(a.sent[1].message.body).toBe('Shorter still.')
  })

  it('is asked once per recipient, not once per channel', async () => {
    // A name in the body is rendered once, and every channel picks from what it answered.
    let asked = 0
    class Counting {
      notify (): any { asked++; return { a: { body: 'a' }, b: { body: 'b' } } }
    }

    const { notifier } = notifierWith({
      channels: [recordingChannel('a'), recordingChannel('b')],
      config: { notices: [{ name: 'n', channels: ['a', 'b'], module: Counting, isClass: true }] }
    })

    await notifier.notify({ id: 'u1' }, 'n')

    expect(asked).toBe(1)
  })

  it('is told who it is writing to, and in which language', async () => {
    const seen: any[] = []
    class Personal {
      notify (event: any, context: any): any {
        seen.push({ event, context })
        return { body: `Hello ${String(context.recipient.id)} in ${String(context.locale)}` }
      }
    }

    const channel = recordingChannel('a')
    const { notifier } = notifierWith({
      channels: [channel],
      config: { notices: [{ name: 'n', channels: ['a'], module: Personal, isClass: true }] }
    })

    await notifier.notify({ id: 'u1', locale: 'fr' }, 'n', { child: 'Lea' })

    expect(seen[0].event).toEqual({ child: 'Lea' })
    expect(seen[0].context).toMatchObject({ locale: 'fr' })
    expect(channel.sent[0].message.body).toBe('Hello u1 in fr')
  })

  it('falls back to the template path for a channel the notice said nothing about', async () => {
    // Better the declared template than an empty body: a channel nobody wrote for still says
    // something, and the omission is visible rather than blank.
    class OnlyEmail { notify (): any { return { smtp: { body: 'Long form.' } } } }

    const sms = recordingChannel('sms')
    const { notifier } = notifierWith({
      channels: [recordingChannel('smtp'), sms],
      config: {
        notices: [{ name: 'n', channels: ['smtp', 'sms'], module: OnlyEmail, isClass: true }],
        templates: { n: 'Short form.' }
      }
    })

    await notifier.notify({ id: 'u1' }, 'n')

    expect(sms.sent[0].message.body).toBe('Short form.')
  })

  it('keeps delivering when the notice itself throws', async () => {
    // A notice is application code, and application code throws. The message falls back to the
    // template path, which at worst renders the key, and the failure is named.
    class Broken { notify (): any { throw new Error('the repository is down') } }

    const channel = recordingChannel('a')
    const { notifier, errors } = notifierWith({
      channels: [channel],
      config: { notices: [{ name: 'n', channels: ['a'], module: Broken, isClass: true }] }
    })

    await notifier.notify({ id: 'u1' }, 'n')

    expect(channel.sent[0].message.body).toBe('n')
    expect(errors.some(([m]) => String(m).includes("notice 'n' threw"))).toBe(true)
  })

  it('takes the channels the notice declared, so the caller does not choose them', async () => {
    // The nature of the message decides its channels. A service inviting a guardian has no reason to
    // know whether that goes by mail or by text.
    class ConsentNeeded { notify (): any { return { body: 'x' } } }

    const smtp = recordingChannel('smtp')
    const sms = recordingChannel('sms')
    const { notifier } = notifierWith({
      channels: [smtp, sms],
      config: {
        default: ['sms'],
        notices: [{ name: 'n', channels: ['smtp'], module: ConsentNeeded, isClass: true }]
      }
    })

    await notifier.notify({ id: 'u1' }, 'n')

    expect(smtp.sent).toHaveLength(1)
    expect(sms.sent).toHaveLength(0)
  })
})

describe('a notice that reacts to a domain event', () => {
  it('is delivered without anybody calling the notifier', async () => {
    // The whole point: a module emits what happened, and the notice says who learns about it. The
    // emitting module imports nothing and is never reopened when a channel is added.
    class GuardianInvited {
      recipients (event: any): any { return { id: event.guardianId, locale: 'fr' } }
      notify (event: any): any { return { body: `Consent for ${String(event.child)}` } }
    }

    const channel = recordingChannel('a')
    const { notifier } = notifierWith({
      channels: [channel],
      config: { notices: [{ name: 'consent', on: 'identity.guardian.invited.v1', channels: ['a'], module: GuardianInvited, isClass: true }] }
    })

    await notifier.deliverNotice('consent', { guardianId: 'g1', child: 'Lea' })

    expect(channel.sent[0].recipient).toMatchObject({ id: 'g1' })
    expect(channel.sent[0].message.body).toBe('Consent for Lea')
    expect(channel.sent[0].message.locale).toBe('fr')
  })

  it('tells several people when the event concerns several', async () => {
    class Announced {
      recipients (event: any): any { return event.members }
      notify (): any { return { body: 'An edition opened.' } }
    }

    const channel = recordingChannel('a')
    const { notifier } = notifierWith({
      channels: [channel],
      config: { notices: [{ name: 'opened', on: 'e.v1', channels: ['a'], module: Announced, isClass: true }] }
    })

    await notifier.deliverNotice('opened', { members: [{ id: 'u1' }, { id: 'u2' }] })

    expect(channel.sent.map(({ recipient }) => recipient.id)).toEqual(['u1', 'u2'])
  })

  it('refuses to guess who, and says exactly what is missing', async () => {
    // The event carries the account and only the notice knows which field that is. Guessing would be
    // worse than nothing: it would send to the wrong person.
    class NoRecipients { notify (): any { return { body: 'x' } } }

    const channel = recordingChannel('a')
    const { notifier, errors } = notifierWith({
      channels: [channel],
      config: { notices: [{ name: 'n', on: 'e.v1', channels: ['a'], module: NoRecipients, isClass: true }] }
    })

    const receipt = await notifier.deliverNotice('n', { anything: true })

    expect(receipt.deliveries).toHaveLength(0)
    expect(channel.sent).toHaveLength(0)
    expect(errors.some(([m]) => String(m).includes('recipients(event)'))).toBe(true)
  })

  it('says so when an event arrives for a notice that no longer exists', async () => {
    const { notifier, warnings } = notifierWith({})

    await notifier.deliverNotice('ghost', {})

    expect(warnings.some(([m]) => String(m).includes("no notice is declared as 'ghost'"))).toBe(true)
  })
})

describe('subscribing the notices', () => {
  const run = async (config: any): Promise<any> => {
    const added: Record<string, unknown[]> = {}
    const blueprint: any = {
      added,
      get: (k: string, f?: unknown) => (k === 'stone.notifications' ? config : f),
      add: (k: string, v: unknown[]) => { added[k] = [...(added[k] ?? []), ...v] }
    }

    await NoticeSubscriptionsMiddleware({ blueprint, modules: [] } as any, (async () => blueprint) as any)

    return added
  }

  it('registers one key-router handler per notice that named an event', async () => {
    // The same array `@stone-js/event-bus` routes incoming domain events through, so nothing here
    // depends on the router package.
    const added = await run({
      notices: [
        { name: 'a', on: 'e.a.v1', module: class {}, isClass: true },
        { name: 'b', module: class {}, isClass: true }
      ]
    })

    expect(added['stone.keyRouting.handlers']).toHaveLength(1)
    expect(added['stone.keyRouting.handlers'][0]).toMatchObject({ key: 'e.a.v1', isFactory: true, action: 'handle' })
  })

  it('registers nothing when no notice named an event', async () => {
    const added = await run({ notices: [{ name: 'a', module: class {}, isClass: true }] })

    expect(added['stone.keyRouting.handlers']).toBeUndefined()
  })

  it('hands the event to the notifier, naming the notice', async () => {
    const delivered: any[] = []
    const added = await run({ notices: [{ name: 'consent', on: 'e.v1', module: class {}, isClass: true }] })
    const entry: any = added['stone.keyRouting.handlers'][0]

    const handler = entry.module({
      make: () => ({ deliverNotice: async (name: string, event: unknown) => { delivered.push({ name, event }) } })
    })

    await handler.handle({ guardianId: 'g1' })

    expect(delivered).toEqual([{ name: 'consent', event: { guardianId: 'g1' } }])
  })
})
