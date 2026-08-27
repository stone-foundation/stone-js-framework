import { JSX } from 'react'
import { siblings } from '../../nav'
import { Code, CodeTabs } from '../../components/Code'
import { HeadContext, IPage, Page, ReactIncomingEvent } from '@stone-js/use-react'
import { ArticleTop, Lead, H2, H3, Callout, Principle, PropsTable, SeeAlso, Pager, Aphorism } from '../../components/content'

const PATH = '/docs/extensions/notifications'

const DECL = `
import { StoneApp } from '@stone-js/core'
import { Notifications } from '@stone-js/notifications'

@Notifications({
  default: ['smtp', 'in-app'],
  channels: [{ name: 'smtp', driver: 'smtp', from: 'App <no-reply@example.test>' }]
})
@StoneApp({ name: 'app' })
export class Application {}
`

const IMP = `
import { defineConfig, defineStoneApp } from '@stone-js/core'
import { notificationsBlueprint } from '@stone-js/notifications'

// Enable the module on the manifest, exactly where the decorator sits
export const App = defineStoneApp({ name: 'app' }, [notificationsBlueprint])

// Then configure it
export const AppConfig = defineConfig((blueprint) => blueprint.set('stone.notifications', {
  default: ['smtp', 'in-app'],
  channels: [{ name: 'smtp', driver: 'smtp', from: 'App <no-reply@example.test>' }],
  recipients: async (id) => await accounts.contactFor(id)
}))
`

const NOTICE_DECL = `
import { Notice } from '@stone-js/notifications'

@Notice({
  name: 'guardianship.consent_needed',
  on: 'identity.guardian.invited.v1',
  channels: ['smtp', 'in-app']
})
export class ConsentNeeded {
  constructor ({ i18n }) { this.i18n = i18n }

  // Who learns about it. Required when the notice reacts to an event.
  recipients (event) { return event.guardianId }

  // What it says, per channel. Asked once per recipient.
  notify (event, { locale }) {
    return {
      smtp: {
        subject: this.i18n.t('consent.subject', { lng: locale }),
        body: this.i18n.t('consent.body', { lng: locale, child: event.childHandle })
      },
      'in-app': { body: this.i18n.t('consent.short', { lng: locale }) }
    }
  }
}
`

const NOTICE_IMP = `
import { defineNotice } from '@stone-js/notifications'

blueprint.set('stone.notifications.notices', [
  defineNotice(ConsentNeeded, {
    name: 'guardianship.consent_needed',
    on: 'identity.guardian.invited.v1',
    channels: ['smtp', 'in-app']
  })
])
`

const CHANNEL_DECL = `
import { NotificationChannel } from '@stone-js/notifications'

@NotificationChannel('sms')
export class TwilioChannel {
  readonly name = 'sms'

  constructor ({ twilio }) { this.twilio = twilio }

  async send (message, recipient) {
    if (recipient.phone === undefined) {
      return { status: 'unreachable', retryable: false, reason: 'No phone number.' }
    }
    await this.twilio.messages.create({ to: recipient.phone, body: message.body })
    return { status: 'sent' }
  }
}
`

const CHANNEL_IMP = `
blueprint.set('stone.notifications.channels', [
  { name: 'sms', factory: () => new TwilioChannel(twilio) }
])
`

/**
 * Extensions: Notifications.
 */
@Page(PATH, { layout: 'docs' })
export class Notifications implements IPage<ReactIncomingEvent> {
  head (): HeadContext {
    return {
      title: 'Notifications',
      description: 'One declaration reaches a person wherever they are: the mailbox, the phone, and the tab they already have open, in their own language.'
    }
  }

  render (): JSX.Element {
    return (
      <>
        <ArticleTop eyebrow='Extensions' title='Notifications' />
        <Lead>
          One declaration reaches a person wherever they are: the mailbox, the phone, and the tab they
          already have open. Delivered out of band, in their own language, without the application
          wiring the three together.
        </Lead>

        <H2>Install</H2>
        <Code file='terminal' lang='bash'>{`npm i @stone-js/notifications

# optional, and each earns its keep:
npm i @stone-js/queue      # deliver out of band rather than in the request
npm i @stone-js/realtime   # reach the tab someone already has open
npm i @stone-js/i18n       # write in the recipient's own language
npm i nodemailer           # the SMTP channel`}</Code>

        <H2>Enable it</H2>
        <Principle
          principle={
            <p>
              Reaching someone is one intention, not three integrations. Where they are reached, and
              in which language, is a property of the person rather than of the code that decided to
              tell them.
            </p>
          }
          incarnation={
            <p>
              A notifier resolves who the person is, renders a template key in their locale, and hands
              the delivery to a queue. Channels are drivers behind one port, so adding the phone
              changes configuration rather than callers.
            </p>
          }
        />
        <CodeTabs file='app/Application.ts' decl={DECL} imp={IMP} />
        <Callout kind='important' title='With nothing configured, nothing is delivered'>
          <p>
            Notifications go to the log and say so on first use. A default that quietly sent real mail
            would send it from the first test run, to real people. Reaching them is a decision, so it
            is written down.
          </p>
        </Callout>

        <H2>A notice: what someone receives</H2>
        <Aphorism>
          The decorator carries the metadata. The class carries the content.
        </Aphorism>
        <p>
          There is no <code>content</code> option, and that is deliberate: text in a decorator is text
          that cannot be translated, formatted, or read off the event. The class is built through the
          container, so it asks for whatever it needs.
        </p>
        <CodeTabs file='app/ConsentNeeded.ts' decl={NOTICE_DECL} imp={NOTICE_IMP} />

        <H3>Nobody calls the notifier</H3>
        <Code file='the path'>{`identity emits  ->  identity.guardian.invited.v1  ->  the notice that named it
                                                     renders, chooses its channels, delivers`}</Code>
        <p>
          The notice subscribes through the light key router, the same one <code>@stone-js/event-bus</code>
          routes domain events through, so the emitting module imports nothing and is never reopened
          when a channel is added. That is the whole reason this is a declaration rather than a service
          call: a coupling that does not exist cannot become a cycle.
        </p>
        <Callout kind='important' title='A body per channel'>
          <p>
            A text message is not an email: one has a subject and room to explain, the other a hundred
            and sixty characters. A channel the notice says nothing about falls back to the declared
            template rather than sending an empty body. And the <em>nature</em> of the message decides
            its channels, not the caller: a service inviting a guardian has no reason to know whether
            that goes by mail or by text.
          </p>
        </Callout>

        <H2>Tell someone something</H2>
        <Code file='app/GuardianshipService.ts'>{`export class GuardianshipService {
  constructor ({ notifier }) { this.notifier = notifier }

  async invite (guardianId, child) {
    await this.notifier.notify(guardianId, 'guardianship.consent_needed', { child })
  }
}`}</Code>
        <p>
          A <strong>template key</strong>, never a rendered body. What is not copied does not have to
          be erased, and a message queued before a translation was fixed goes out fixed.
        </p>
        <Code file='app/anywhere.ts'>{`await notifier.notify({ id: 'u1', email: 'a@example.test', locale: 'fr' }, 'welcome')
await notifier.notify(['u1', 'u2'], 'edition.opened', { edition: 'Spring' })
await notifier.notify(user, 'welcome', {}, { channels: ['in-app'], inline: true })`}</Code>

        <H2>What this module decides, and what it does not</H2>
        <Aphorism>
          It decides who learns what, through which channel, and in which language. It never decides
          whether to send.
        </Aphorism>
        <p>
          Consent, preferences, quiet hours and audiences are yours, because the rules that matter
          there are about your own people: a framework imposing them would be wrong for the first
          application whose rules differ. Make that call, then call here.
        </p>

        <H2>Channels</H2>
        <PropsTable nameHeader='channel' rows={[
          { name: 'log', type: 'built-in', desc: 'The zero-config default. Writes the message where you write everything else and reaches nobody. Right in development and in tests, and not a channel anywhere else.' },
          { name: 'in-app', type: 'realtime', desc: "Broadcasts on the recipient's own realtime channel, so an open tab receives it. Needs @stone-js/realtime." },
          { name: 'smtp', type: 'nodemailer', desc: "Email over SMTP. SMTP rather than a provider's API, so one channel reaches all of them without this package choosing a vendor for you." }
        ]} />
        <p>
          <code>sms</code> and <code>push</code> are not shipped, deliberately: a channel that picked a
          vendor would be wrong for everyone who chose a different one. Register yours, and it is a
          channel like any other.
        </p>
        <CodeTabs file='app/TwilioChannel.ts' decl={CHANNEL_DECL} imp={CHANNEL_IMP} />

        <H3>The port a channel implements</H3>
        <p>
          <code>send(message, recipient)</code> <strong>returns</strong> an outcome and does not throw,
          for everything it can foresee. The outcome says whether another attempt could work: a
          provider being down is retryable, an address that does not exist never will be, and retrying
          that forever is how a queue fills with work that cannot succeed.
        </p>
        <Callout kind='note' title='A channel that throws anyway'>
          It is treated as retryable, because a throw is an adapter bug rather than a verdict. Burying
          a channel's whole traffic the day a provider client changes its error shapes would be worse
          than one retry too many.
        </Callout>

        <H2>The language a message is written in</H2>
        <p>
          The <strong>recipient's</strong>, never the request's. A French-speaking guardian invited by
          an English-speaking member of staff reads French. Getting that backwards is invisible in
          every test written by one person in one language, and obvious to the person who receives it.
        </p>
        <p>
          Keys are looked up in <code>@stone-js/i18n</code> under <code>&lt;key&gt;.subject</code> and
          <code> &lt;key&gt;.body</code>, in that person's locale. Without a catalogue, declare
          templates in configuration.
        </p>
        <Code file='app/AppConfig.ts'>{`templates: {
  'guardianship.consent_needed': {
    subject: 'Your consent is needed',
    body: 'Please confirm for {{ child }}.'
  }
}`}</Code>
        <Callout kind='important' title='A missing translation renders its key'>
          Never an empty string. An empty subject looks like a broken mail client and gets ignored for
          months, while <code>guardianship.consent_needed</code> is visibly ours and gets reported the
          same day.
        </Callout>

        <H2>Delivery is out of band</H2>
        <Code file='the path'>{`notify()  ->  resolve the person, choose the channels, dispatch a job
          ->  a worker delivers  ->  the provider, and the open tab`}</Code>
        <p>
          Deciding who learns what is fast. Reaching a mail provider is not, and a request that waits
          for one is a request that times out on the endpoint the user is watching. The worker runs the
          same code the inline path runs, so a retry means exactly what the first attempt meant.
        </p>
        <p>
          Without a queue, delivery happens in the request, which is right for development and says so
          when it was not what you asked for. And <code>notify()</code> never throws at its caller: a
          notification is almost always a side effect of something that already succeeded, and failing
          that operation because a provider was down would undo work that was correct.
        </p>

        <H2>The same message twice</H2>
        <p>
          The most common production failure of any notification system: a queue is at-least-once, a
          retry half succeeded, or two events describe one fact. Name the occurrence and the repeat is
          dropped.
        </p>
        <Code file='app/anywhere.ts'>{`await notifier.notify(user, 'welcome', {}, { dedupe: \`welcome:\${user.id}\` })`}</Code>
        <p>
          A notice states its own through <code>dedupe(event)</code>. Keys are claimed atomically in
          the cache store the application already chose, so this module stores nothing of its own.
          Without the cache module, deduplication does not happen and says so once: sending twice in
          silence is the failure it exists to prevent.
        </p>

        <H2>Who received what</H2>
        <p>
          This module keeps no delivery ledger, because the answer to "why did they never receive it"
          belongs in whatever the application already queries. It announces instead, and you write the
          row you need.
        </p>
        <Code file='app/NotificationLedger.ts'>{`@BusHandler()
export class NotificationLedger {
  @OnBusEvent('notification.failed')
  onFailed (event) { /* ... write your own row */ }
}`}</Code>
        <Callout kind='note' title='The event carries an id, never an address'>
          It leaves the process, and an address in an event is an address in every log that event
          passes through.
        </Callout>

        <H2>Seeing it before sending it</H2>
        <Code file='app/anywhere.ts'>{`const previewed = await notifier.preview(guardian, 'guardianship.consent_needed', { child: 'Lea' })
// [{ recipient, channel: 'smtp', message: { subject, body, locale } }, ...]`}</Code>
        <p>
          Exactly what delivery would render, per channel, with nothing sent. For the screen that shows
          a member of staff what a guardian is about to receive, and for a test that checks a notice
          without a channel.
        </p>

        <H2>Later rather than now</H2>
        <Code file='app/anywhere.ts'>{`await notifier.notify(user, 'trial.ending', {}, { delay: 86_400 })`}</Code>
        <p>
          Deferred by the queue, because a timer held in a process a cold start can end is not a
          reminder.
        </p>

        <H2>Configuration</H2>
        <PropsTable rows={[
          { name: 'channels', type: 'ChannelConfig[]', desc: 'The channels this application configures.' },
          { name: 'default', type: 'string[]', default: "['log']", desc: 'The channels a notification uses when it names none.' },
          { name: 'recipients', type: 'function', desc: 'How to turn an id into a person. The one thing this module cannot ship: the address is then read at send time rather than copied into a message.' },
          { name: 'templates', type: 'object', desc: 'Templates, for an application with no translation catalogue. Also the override when there is one.' },
          { name: 'dispatch', type: "'queue' | 'inline'", desc: 'Defaults to queue when a queue is enabled, and to inline otherwise, saying so once.' },
          { name: 'queue', type: 'string', desc: 'Which queue to dispatch on.' },
          { name: 'attempts', type: 'number', desc: 'How many times a queued delivery is retried.' },
          { name: 'notices', type: 'NoticeDeclaration[]', desc: 'Notices declared in configuration rather than with @Notice. Both are read.' },
          { name: 'dedupe', type: '{ ttl, store }', desc: 'Where a repeated occurrence is recognised. Keys live in @stone-js/cache.' },
          { name: 'announce', type: 'boolean', desc: 'Emit notification.delivered and notification.failed on the bus. On when a bus is enabled.' }
        ]} />

        <SeeAlso links={[
          { title: 'Queue', path: '/docs/extensions/queue' },
          { title: 'Realtime', path: '/docs/extensions/realtime' },
          { title: 'i18n', path: '/docs/extensions/i18n' }
        ]} />
        <Pager {...siblings(PATH)} />
      </>
    )
  }
}
