import { LogChannel } from '../src/channels/LogChannel'
import { SmtpChannel } from '../src/channels/SmtpChannel'
import { InAppChannel } from '../src/channels/InAppChannel'
import { RenderedNotification } from '../src/declarations'

const message: RenderedNotification = {
  template: 'guardianship.consent_needed',
  params: { child: 'Lea' },
  subject: 'Your consent is needed',
  body: 'Please confirm.',
  locale: 'en'
}

describe('the channel that delivers nothing', () => {
  it('reports sent, because writing it down is all it promises', async () => {
    const written: any[] = []
    const channel = LogChannel.create({ name: 'log' }, { info: (...args: any[]) => written.push(args) } as any)

    await expect(channel.send(message, { id: 'u1' })).resolves.toEqual({ status: 'sent' })
    expect(written).toHaveLength(1)
  })

  it('names the person without spelling out an address', async () => {
    // A log line is read by more people than a database row: enough to follow a message, nothing to
    // leak one.
    const written: any[] = []
    const logger = { info: (...args: any[]) => written.push(args) } as any

    await LogChannel.create({ name: 'log' }, logger).send(message, { email: 'someone@example.test' })

    expect(String(written[0][0])).not.toContain('someone@example.test')
    expect(String(written[0][0])).toContain('an email address')
  })

  it('says the template and the locale, which is what following a message needs', async () => {
    const written: any[] = []
    const logger = { info: (...args: any[]) => written.push(args) } as any

    await LogChannel.create({ name: 'log' }, logger).send(message, { id: 'u1' })

    expect(String(written[0][0])).toContain('guardianship.consent_needed')
    expect(written[0][1]).toMatchObject({ locale: 'en' })
  })

  it('works with no logger bound at all', async () => {
    await expect(LogChannel.create().send(message, {})).resolves.toEqual({ status: 'sent' })
  })
})

describe('the channel that reaches an open screen', () => {
  it('broadcasts on the recipient own channel', async () => {
    // This is the half that makes the module worth having here: one notify() reaches the mailbox and
    // the tab, and the application wires neither to the other.
    const emitted: any[] = []
    const broadcaster = {
      to: (channel: string) => ({ emit: async (event: string, payload: unknown) => { emitted.push({ channel, event, payload }) } })
    }

    await expect(InAppChannel.create({ name: 'in-app' }, broadcaster).send(message, { id: 'u1' }))
      .resolves.toEqual({ status: 'sent' })

    expect(emitted[0].channel).toBe('user.u1.notifications')
    expect(emitted[0].event).toBe('notification')
    expect(emitted[0].payload).toMatchObject({ template: 'guardianship.consent_needed', body: 'Please confirm.' })
  })

  it('lets the application name the channel and the event', async () => {
    const emitted: any[] = []
    const broadcaster = {
      to: (channel: string) => ({ emit: async (event: string) => { emitted.push({ channel, event }) } })
    }

    const channel = InAppChannel.create(
      { name: 'in-app', event: 'inbox', channelFor: (r: any) => `inbox:${String(r.id)}` },
      broadcaster
    )

    await channel.send(message, { id: 'u1' })

    expect(emitted[0]).toEqual({ channel: 'inbox:u1', event: 'inbox' })
  })

  it('reports unreachable, not failed, when the recipient has no id', async () => {
    // Not an error: a person nobody can address in-app is exactly why the other channels exist. And
    // not retryable, because they will not grow an id between attempts.
    const broadcaster = { to: () => ({ emit: async () => {} }) }

    await expect(InAppChannel.create({ name: 'in-app' }, broadcaster).send(message, {}))
      .resolves.toMatchObject({ status: 'unreachable', retryable: false })
  })

  it('names the setup gap when no broadcaster is around, and does not ask to be retried', async () => {
    const outcome = await InAppChannel.create({ name: 'in-app' }).send(message, { id: 'u1' })

    expect(outcome).toMatchObject({ status: 'failed', retryable: false })
    expect(outcome.reason).toContain('realtime')
  })
})

describe('the channel that sends mail', () => {
  const transport = (over: any = {}): any => ({
    sent: [] as any[],
    async sendMail (mail: any) {
      this.sent.push(mail)
      if (over.throws !== undefined) { throw over.throws }
      return { messageId: 'abc' }
    },
    ...over
  })

  it('sends what was rendered, from where the application said', async () => {
    const mailer = transport()
    const channel = SmtpChannel.create({ name: 'smtp', transport: mailer, from: 'App <no-reply@x.test>' })

    await expect(channel.send(message, { email: 'a@x.test' })).resolves.toEqual({ status: 'sent', id: 'abc' })
    expect(mailer.sent[0]).toMatchObject({
      from: 'App <no-reply@x.test>',
      to: 'a@x.test',
      subject: 'Your consent is needed',
      text: 'Please confirm.'
    })
  })

  it('reports unreachable when the person has no mailbox here', async () => {
    const channel = SmtpChannel.create({ name: 'smtp', transport: transport(), from: 'a@x.test' })

    await expect(channel.send(message, { id: 'u1' })).resolves.toMatchObject({
      status: 'unreachable',
      retryable: false
    })
  })

  it('refuses without a from address, and does not ask to be retried', async () => {
    // No default could be right: a from address nobody chose is refused by the first receiving server
    // that checks it, and retrying would not change that.
    const channel = SmtpChannel.create({ name: 'smtp', transport: transport() })

    const outcome = await channel.send(message, { email: 'a@x.test' })

    expect(outcome).toMatchObject({ status: 'failed', retryable: false })
    expect(outcome.reason).toContain('`from`')
  })

  it('asks to be retried when the provider is having a bad day', async () => {
    const mailer = transport({ throws: Object.assign(new Error('connection reset'), { responseCode: 421 }) })
    const channel = SmtpChannel.create({ name: 'smtp', transport: mailer, from: 'a@x.test' })

    await expect(channel.send(message, { email: 'b@x.test' })).resolves.toMatchObject({
      status: 'failed',
      retryable: true
    })
  })

  it('does not ask to be retried when the address was refused for good', async () => {
    // SMTP says which by its status code: 5xx is permanent. Retrying a rejected address forever is
    // how a queue fills with work that cannot succeed.
    const mailer = transport({ throws: Object.assign(new Error('no such user'), { responseCode: 550 }) })
    const channel = SmtpChannel.create({ name: 'smtp', transport: mailer, from: 'a@x.test' })

    await expect(channel.send(message, { email: 'b@x.test' })).resolves.toMatchObject({
      status: 'failed',
      retryable: false
    })
  })

  it('builds its transport once, however many messages it sends', async () => {
    let built = 0
    const mailer = transport()
    const channel = SmtpChannel.create({
      name: 'smtp',
      from: 'a@x.test',
      get transport () { built++; return mailer }
    } as any)

    await channel.send(message, { email: 'b@x.test' })
    await channel.send(message, { email: 'c@x.test' })

    expect(built).toBe(1)
    expect(mailer.sent).toHaveLength(2)
  })

  it('says it needs nodemailer, rather than reporting a failed delivery', async () => {
    // A missing package is a setup mistake. Answering "could not send" would put it in the retry
    // queue forever, failing identically every time.
    vi.resetModules()
    vi.doMock('nodemailer', () => { throw new Error('not installed') })

    const { SmtpChannel: Fresh } = await import('../src/channels/SmtpChannel')
    const { NotificationConfigurationError: FreshError } = await import('../src/errors/NotificationError')

    // It leaves as itself rather than as a delivery outcome, so the cause survives to the log.
    await expect(Fresh.create({ name: 'smtp', from: 'a@x.test' }).send(message, { email: 'b@x.test' }))
      .rejects.toThrow(FreshError)

    vi.doUnmock('nodemailer')
    vi.resetModules()
  })

  it('builds a transport from the options it was given', async () => {
    vi.resetModules()
    const built: unknown[] = []
    vi.doMock('nodemailer', () => ({
      default: {
        createTransport: (options: unknown) => {
          built.push(options)
          return { sendMail: async () => ({ messageId: 'x' }) }
        }
      }
    }))

    const { SmtpChannel: Fresh } = await import('../src/channels/SmtpChannel')

    await Fresh.create({ name: 'smtp', from: 'a@x.test', transport: { host: 'mail.x.test' } })
      .send(message, { email: 'b@x.test' })

    expect(built).toEqual([{ host: 'mail.x.test' }])

    vi.doUnmock('nodemailer')
    vi.resetModules()
  })
})

describe('naming a recipient in a log', () => {
  const written: any[] = []
  const logger = { info: (...args: any[]) => written.push(args) } as any

  beforeEach(() => { written.length = 0 })

  it('says a phone number without printing one', async () => {
    await LogChannel.create({ name: 'log' }, logger).send(message, { phone: '+33600000000' })

    expect(String(written[0][0])).toContain('a phone number')
    expect(String(written[0][0])).not.toContain('+33600000000')
  })

  it('says plainly when there is nothing to reach at all', async () => {
    await LogChannel.create({ name: 'log' }, logger).send(message, {})

    expect(String(written[0][0])).toContain('someone with no address')
  })

  it('prefers the id, which identifies without exposing', async () => {
    await LogChannel.create({ name: 'log' }, logger).send(message, { id: 'u1', email: 'a@x.test' })

    expect(String(written[0][0])).toContain('user:u1')
  })

  it('takes a name of its own when the application gave one', async () => {
    expect(LogChannel.create({ name: 'audit' }).name).toBe('audit')
    expect(LogChannel.create().name).toBe('log')
    expect(SmtpChannel.create({ name: 'mail' } as any).name).toBe('mail')
    expect(InAppChannel.create().name).toBe('in-app')
  })
})
