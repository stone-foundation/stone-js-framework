import { Notifier } from '../src/Notifier'
import { getBlueprint } from '@stone-js/core'
import { DELIVERY_JOB } from '../src/constants'
import { LogChannel } from '../src/channels/LogChannel'
import { SmtpChannel } from '../src/channels/SmtpChannel'
import { InAppChannel } from '../src/channels/InAppChannel'
import { Notifications } from '../src/decorators/Notifications'
import { NotificationManager } from '../src/NotificationManager'
import { DeliverNotification } from '../src/jobs/DeliverNotification'
import { NotificationChannel } from '../src/decorators/NotificationChannel'
import { notificationsBlueprint } from '../src/options/NotificationsBlueprint'
import { NotificationServiceProvider } from '../src/NotificationServiceProvider'
import { NotificationConfigurationError } from '../src/errors/NotificationError'

const makeContainer = (config: any, bound: Record<string, unknown> = {}): any => {
  const container: any = {
    make: vi.fn((key: unknown) => (
      key === 'blueprint' ? { get: (k: string, f?: unknown) => (k === 'stone.notifications' ? config : f) } : bound[key as string]
    )),
    has: vi.fn((key: unknown) => typeof key === 'string' && key in bound),
    resolve: vi.fn((target: any) => new target({})),
    instanceIf: vi.fn(() => container),
    singletonIf: vi.fn(() => container),
    alias: vi.fn(() => container)
  }
  return container
}

const managerOf = (container: any): NotificationManager => container.instanceIf.mock.calls[0][1]

describe('activating the module', () => {
  afterEach(() => { NotificationManager.setInstance(undefined) })

  it('contributes the provider and the delivery job', () => {
    @Notifications()
    class Application {}

    const blueprint = getBlueprint(Application)

    expect(blueprint?.stone?.providers).toContain(NotificationServiceProvider)
    expect(blueprint?.stone?.queue?.handlers).toEqual([
      { name: DELIVERY_JOB, module: DeliverNotification, isClass: true, action: 'handle' }
    ])
  })

  it('carries the decorator options into the config bucket', () => {
    @Notifications({ default: ['smtp'], queue: 'mail' })
    class Application {}

    expect(getBlueprint(Application)?.stone?.notifications).toEqual({ default: ['smtp'], queue: 'mail' })
  })

  it('leaves the shared blueprint alone, so one application cannot configure another', () => {
    @Notifications({ default: ['smtp'] })
    class Application {}

    expect(getBlueprint(Application)?.stone?.notifications?.default).toEqual(['smtp'])
    expect(notificationsBlueprint.stone.notifications).toEqual({})
  })

  it('says the same thing as registering the blueprint', () => {
    // The two activation paths are the same declaration: a decorator, or the blueprint, never a third
    // helper that could drift from either.
    @Notifications()
    class Application {}

    expect(getBlueprint(Application)?.stone?.providers).toEqual(notificationsBlueprint.stone.providers)
    expect(getBlueprint(Application)?.stone?.queue).toEqual(notificationsBlueprint.stone.queue)
  })
})

describe('wiring the channels up', () => {
  afterEach(() => { NotificationManager.setInstance(undefined) })

  it('binds the notifier and the registry, and publishes the registry', () => {
    const container = makeContainer({})

    new NotificationServiceProvider(container).register()

    expect(container.instanceIf).toHaveBeenCalledWith(NotificationManager, expect.any(NotificationManager))
    expect(container.alias).toHaveBeenCalledWith(Notifier, ['notifier'])
    expect(NotificationManager.getInstance()).toBe(managerOf(container))
  })

  it('is zero-config: the log channel is always there', async () => {
    // An application that calls notify() and configures nothing sees what it would have sent, rather
    // than a configuration error.
    const container = makeContainer({})

    new NotificationServiceProvider(container).register()

    expect(managerOf(container).channel('log')).toBeInstanceOf(LogChannel)
  })

  it('builds each configured channel under its name', () => {
    const container = makeContainer({
      channels: [
        { name: 'mail', driver: 'smtp', from: 'a@x.test' },
        { name: 'screen', driver: 'in-app' }
      ]
    })

    new NotificationServiceProvider(container).register()
    const manager = managerOf(container)

    expect(manager.channel('mail')).toBeInstanceOf(SmtpChannel)
    expect(manager.channel('screen')).toBeInstanceOf(InAppChannel)
  })

  it('builds a channel on first use, not at boot', () => {
    // A mail transport built at boot means an application configured for production cannot start
    // locally.
    const container = makeContainer({ channels: [{ name: 'mail', driver: 'smtp', from: 'a@x.test' }] })

    expect(() => new NotificationServiceProvider(container).register()).not.toThrow()
  })

  it('refuses an unknown driver at setup, and names the way out', () => {
    const container = makeContainer({ channels: [{ name: 'sms', driver: 'twilio' }] })

    expect(() => new NotificationServiceProvider(container).register()).toThrow(NotificationConfigurationError)
    expect(() => new NotificationServiceProvider(container).register()).toThrow(/factory/)
  })

  it('takes a channel the application built itself', async () => {
    // How `sms` and `push` are done: a channel that picked a vendor would be wrong for everyone who
    // chose a different one.
    const mine = { name: 'sms', send: async () => ({ status: 'sent' as const }) }
    const container = makeContainer({ channels: [{ name: 'sms', factory: () => mine }] })

    new NotificationServiceProvider(container).register()

    expect(managerOf(container).channel('sms')).toBe(mine)
  })

  it('hands the in-app channel the broadcaster when realtime is enabled', async () => {
    const emitted: any[] = []
    const broadcaster = { to: (c: string) => ({ emit: async (e: string) => { emitted.push({ c, e }) } }) }
    const container = makeContainer({ channels: [{ name: 'screen', driver: 'in-app' }] }, { broadcaster })

    new NotificationServiceProvider(container).register()

    await managerOf(container).channel('screen').send(
      { template: 't', params: {}, subject: 's', body: 'b', locale: 'en' },
      { id: 'u1' }
    )

    expect(emitted).toHaveLength(1)
  })
})

describe('declaring a channel as a class', () => {
  afterEach(() => { NotificationManager.setInstance(undefined) })

  it('registers it under the name it declared', () => {
    @NotificationChannel('sms')
    class TwilioChannel {
      readonly name = 'sms'
      async send (): Promise<any> { return { status: 'sent' } }
    }

    expect(getBlueprint(TwilioChannel)?.stone?.notifications?.channels).toEqual([
      { name: 'sms', module: TwilioChannel, isClass: true }
    ])
  })

  it('is built through the container, so its constructor is auto-wired', () => {
    class TwilioChannel {
      readonly name = 'sms'
      async send (): Promise<any> { return { status: 'sent' } }
    }

    const container = makeContainer({ channels: [{ name: 'sms', module: TwilioChannel, isClass: true }] })

    new NotificationServiceProvider(container).register()

    expect(managerOf(container).channel('sms')).toBeInstanceOf(TwilioChannel)
  })

  it('refuses a class that does not answer send, and says what a channel is', () => {
    class NotAChannel { readonly name = 'sms' }

    const container = makeContainer({ channels: [{ name: 'sms', module: NotAChannel, isClass: true }] })

    new NotificationServiceProvider(container).register()

    expect(() => managerOf(container).channel('sms')).toThrow(/send\(message, recipient\)/)
  })
})

describe('the registry', () => {
  it('says which channel is missing rather than delivering to nobody', () => {
    // A notification naming a channel nobody registered is a setup mistake, and it must not read as
    // a delivery: one silently drops the message, the other blames the recipient.
    const manager = NotificationManager.create()

    expect(() => manager.channel('ghost')).toThrow(NotificationConfigurationError)
    expect(() => manager.channel('ghost')).toThrow(/ghost/)
  })

  it('builds a factory-registered channel once and reuses it', () => {
    let built = 0
    const manager = NotificationManager.create()

    manager.registerFactory('mine', () => { built++; return { name: 'mine', send: async () => ({ status: 'sent' }) } })

    expect(manager.channel('mine')).toBe(manager.channel('mine'))
    expect(built).toBe(1)
  })

  it('says what it holds', () => {
    const manager = NotificationManager.create()

    manager.register({ name: 'a', send: async () => ({ status: 'sent' }) })
    manager.registerFactory('b', () => ({ name: 'b', send: async () => ({ status: 'sent' }) }))

    expect(manager.has('a')).toBe(true)
    expect(manager.has('c')).toBe(false)
    expect(manager.names().sort()).toEqual(['a', 'b'])
  })
})

describe('the worker side of a notification', () => {
  it('throws only when another attempt could work', async () => {
    // The whole contract with the queue. A permanent failure that threw would be retried until the
    // attempts ran out, on work that cannot succeed, and an unreachable recipient would look like an
    // outage.
    const job = new DeliverNotification({
      notifier: { deliver: async () => [{ status: 'failed', retryable: true, reason: 'provider down', channel: 'mail' }] } as any
    })

    await expect(job.handle({ template: 'welcome' } as any)).rejects.toThrow(/provider down/)
  })

  it('does not throw for a failure another attempt cannot fix', async () => {
    const job = new DeliverNotification({
      notifier: { deliver: async () => [{ status: 'unreachable', retryable: false, channel: 'mail' }] } as any
    })

    await expect(job.handle({ template: 'welcome' } as any)).resolves.toEqual([
      { status: 'unreachable', retryable: false, channel: 'mail' }
    ])
  })

  it('names every channel worth retrying, and why', async () => {
    const job = new DeliverNotification({
      notifier: {
        deliver: async () => [
          { status: 'sent', channel: 'screen' },
          { status: 'failed', retryable: true, reason: 'timeout', channel: 'mail' }
        ]
      } as any
    })

    await expect(job.handle({ template: 'welcome' } as any)).rejects.toThrow(/'mail'.*timeout/)
  })

  it('answers the outcomes when everything went out', async () => {
    const job = new DeliverNotification({
      notifier: { deliver: async () => [{ status: 'sent', channel: 'mail' }] } as any
    })

    await expect(job.handle({ template: 'welcome' } as any)).resolves.toHaveLength(1)
  })
})

describe('the seams a channel reaches through', () => {
  afterEach(() => { NotificationManager.setInstance(undefined) })

  it('builds the in-app channel with no broadcaster when realtime is absent', async () => {
    // It then reports the setup gap on send rather than at boot, so an application that never uses
    // the channel still starts.
    const container = makeContainer({ channels: [{ name: 'screen', driver: 'in-app' }] })

    new NotificationServiceProvider(container).register()

    await expect(managerOf(container).channel('screen').send(
      { template: 't', params: {}, subject: 's', body: 'b', locale: 'en' },
      { id: 'u1' }
    )).resolves.toMatchObject({ status: 'failed', retryable: false })
  })

  it('builds the log channel with no logger bound', async () => {
    const container = makeContainer({ channels: [{ name: 'audit', driver: 'log' }] })

    new NotificationServiceProvider(container).register()

    await expect(managerOf(container).channel('audit').send(
      { template: 't', params: {}, subject: 's', body: 'b', locale: 'en' },
      { id: 'u1' }
    )).resolves.toEqual({ status: 'sent' })
  })

  it('treats a channel that names no driver as a log channel', () => {
    const container = makeContainer({ channels: [{ name: 'somewhere' }] })

    new NotificationServiceProvider(container).register()

    expect(managerOf(container).channel('somewhere')).toBeInstanceOf(LogChannel)
  })

  it('refuses a declared class the container cannot build', () => {
    const container = makeContainer({ channels: [{ name: 'sms', module: class {}, isClass: true }] })
    container.resolve = vi.fn(() => undefined)

    new NotificationServiceProvider(container).register()

    expect(() => managerOf(container).channel('sms')).toThrow(NotificationConfigurationError)
  })
})
