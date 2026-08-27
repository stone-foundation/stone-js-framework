# Stone.js - Notifications

[![npm license](https://img.shields.io/npm/l/@stone-js/notifications)](https://opensource.org/licenses/MIT)
[![npm version](https://img.shields.io/npm/v/@stone-js/notifications)](https://www.npmjs.com/package/@stone-js/notifications)
[![npm downloads](https://img.shields.io/npm/dm/@stone-js/notifications)](https://www.npmjs.com/package/@stone-js/notifications)
![Maintenance](https://img.shields.io/maintenance/yes/2026)
[![CI](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/ci.yml)
[![Release](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml/badge.svg)](https://github.com/stone-foundation/stone-js-framework/actions/workflows/release.yml)
[![Quality Gate Status](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=alert_status)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Coverage](https://sonarcloud.io/api/project_badges/measure?project=stone-foundation_stone-js-framework&metric=coverage)](https://sonarcloud.io/summary/new_code?id=stone-foundation_stone-js-framework)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](https://github.com/stone-foundation/stone-js-framework/blob/main/SECURITY.md)
[![CodeQL](https://github.com/stone-foundation/stone-js-framework/actions/workflows/github-code-scanning/codeql/badge.svg)](https://github.com/stone-foundation/stone-js-framework/security/code-scanning)
[![Dependabot Status](https://img.shields.io/badge/Dependabot-enabled-brightgreen.svg)](https://github.com/stone-foundation/stone-js-framework/network/updates)
[![Conventional Commits](https://img.shields.io/badge/Conventional%20Commits-1.0.0-yellow.svg)](https://conventionalcommits.org)

**Notifications for Stone.js.** One declaration reaches a person wherever they are: the mailbox, the
phone, and the tab they already have open. Delivered out of band, in their own language.

**Nobody has to call it.** A module emits what happened; the notice that named that event decides
who learns about it, through which channels, and in what words. The emitting module imports nothing
and is never reopened when a channel is added.

**Decide now, deliver later.** A request resolves who the person is and hands the delivery to a
queue. Reaching a mail provider takes as long as it takes, and a request that waits for one is a
request that times out on the endpoint the user is watching.

---

## Installation

```bash
npm install @stone-js/notifications

# optional, and each earns its keep:
npm install @stone-js/queue      # deliver out of band rather than in the request
npm install @stone-js/realtime   # reach the tab someone already has open
npm install @stone-js/i18n       # write in the recipient's own language
npm install nodemailer           # the SMTP channel (9.0.1 or later)
```

> Peer dependency: `@stone-js/core`. Everything else is optional, and the module degrades to
> something honest without each of them.

## Enable it

Declarative:

```ts
import { StoneApp } from '@stone-js/core'
import { Notifications } from '@stone-js/notifications'

@Notifications({
  default: ['smtp', 'in-app'],
  channels: [{ name: 'smtp', driver: 'smtp', from: 'App <no-reply@example.test>' }]
})
@StoneApp({ name: 'app' })
export class Application {}
```

Imperative, through `stone.notifications`:

```ts
import { defineConfig, defineStoneApp } from '@stone-js/core'
import { notificationsBlueprint } from '@stone-js/notifications'

export const App = defineStoneApp({ name: 'app' }, [notificationsBlueprint])

export const AppConfig = defineConfig((blueprint) => blueprint.set('stone.notifications', {
  default: ['smtp', 'in-app'],
  channels: [{ name: 'smtp', driver: 'smtp', from: 'App <no-reply@example.test>' }],
  recipients: async (id) => await accounts.contactFor(id)
}))
```

With nothing configured, notifications go to the log and say so on first use. Reaching real people
is a decision, so it is written down: a default that quietly sent real mail would send it from the
first test run.

## A notice: what someone receives

```ts
@Notice({
  name: 'guardianship.consent_needed',
  on: 'identity.guardian.invited.v1',
  channels: ['smtp', 'in-app']
})
export class ConsentNeeded {
  constructor ({ i18n }) { this.i18n = i18n }

  // Who learns about it. Required when the notice reacts to an event: the event carries the
  // account, and only the notice knows which field that is.
  recipients (event) { return event.guardianId }

  // What it says, per channel. Asked once per recipient, so a name in the body is rendered once.
  notify (event, { locale, recipient }) {
    return {
      smtp: {
        subject: this.i18n.t('consent.subject', { lng: locale }),
        body: this.i18n.t('consent.body', { lng: locale, child: event.childHandle })
      },
      'in-app': { body: this.i18n.t('consent.short', { lng: locale }) }
    }
  }

  // Optional: the same fact, told once, however many times it arrives.
  dedupe (event) { return event.eventId }
}
```

**The decorator carries metadata; the class carries content.** There is no `content` option, and
that is deliberate: text in a decorator is text that cannot be translated, formatted, or read off
the event. The class is built through the container, so it asks for whatever it needs.

The imperative form says the same thing:

```ts
blueprint.set('stone.notifications.notices', [
  defineNotice(ConsentNeeded, { name: 'guardianship.consent_needed', on: 'identity.guardian.invited.v1' })
])
```

### Nobody calls the notifier

```
identity emits  ->  identity.guardian.invited.v1  ->  the notice that named it
                                                       renders, chooses its channels, delivers
```

The notice subscribes through the light key router, the same one `@stone-js/event-bus` routes domain
events through, so `identity` imports nothing. Add a channel later and only the notice changes.

**A body per channel matters.** A text message is not an email: one has a subject and room to
explain, the other has a hundred and sixty characters. A channel the notice says nothing about falls
back to the declared template rather than sending an empty body.

**The nature of the message decides its channels**, not the caller. A service inviting a guardian has
no reason to know whether that goes by mail or by text.

## Tell someone something

```ts
export class GuardianshipService {
  constructor (private readonly notifier) {}

  async invite (guardianId: string, child: string) {
    await this.notifier.notify(guardianId, 'guardianship.consent_needed', { child })
  }
}
```

A **template key**, never a rendered body. What is not copied does not have to be erased, and a
message queued before a translation was fixed goes out fixed.

The recipient can be the person, or their id when a directory can resolve one:

```ts
await notifier.notify({ id: 'u1', email: 'a@example.test', locale: 'fr' }, 'welcome')
await notifier.notify(['u1', 'u2'], 'edition.opened', { edition: 'Spring' })
await notifier.notify(user, 'welcome', {}, { channels: ['in-app'], inline: true })
```

## What this module decides, and what it does not

It decides **who learns what, through which channel, and in which language**.

It never decides **whether** to send. Consent, preferences, quiet hours and audiences are yours,
because the rules that matter there are about your own people: a framework imposing them would be
wrong for the first application whose rules differ. Make that call, then call here.

## Channels

| Channel | What it is |
|---|---|
| `log` | The zero-config default. Writes the message where you write everything else and **reaches nobody**. Right in development and in tests, and not a channel anywhere else. |
| `in-app` | Broadcasts on the recipient's own realtime channel, so an open tab receives it. Needs `@stone-js/realtime`. |
| `smtp` | Email over SMTP, through `nodemailer`. SMTP rather than a provider's API, so one channel reaches all of them without this package choosing a vendor for you. |

`sms` and `push` are not shipped, deliberately: a channel that picked a vendor would be wrong for
everyone who chose a different one. Register yours, and it is a channel like any other:

```ts
channels: [{ name: 'sms', factory: () => new TwilioChannel(twilio) }]
```

Or as a class the container builds, which is how it gets its dependencies:

```ts
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
```

### The port a channel implements

`send(message, recipient)` **returns** an outcome and does not throw, for everything it can foresee.
The outcome says whether another attempt could work: a provider being down is retryable, an address
that does not exist never will be, and retrying that forever is how a queue fills with work that
cannot succeed.

A channel that throws anyway is treated as retryable, because a throw is an adapter bug rather than
a verdict.

## The language a message is written in

The **recipient's**, never the request's. A French-speaking guardian invited by an English-speaking
member of staff reads French.

Keys are looked up in `@stone-js/i18n` under `<key>.subject` and `<key>.body`, in that person's
locale. Without a catalogue, declare templates in configuration:

```ts
templates: {
  'guardianship.consent_needed': {
    subject: 'Your consent is needed',
    body: 'Please confirm for {{ child }}.'
  }
}
```

A missing translation renders its **key**, never an empty string: an empty subject looks like a
broken mail client and gets ignored for months, while `guardianship.consent_needed` is visibly ours
and gets reported the same day.

## Delivery is out of band

With `@stone-js/queue` enabled, `notify()` resolves the recipient, decides the channels and dispatches
a job. A worker performs the delivery, running the same code the inline path runs, so a retry means
exactly what the first attempt meant.

Without a queue, delivery happens in the request, which is right for development and says so when it
was not what you asked for.

`notify()` never throws at its caller. A notification is almost always a side effect of something
that already succeeded, and failing that operation because a mail provider was down would undo work
that was correct.

## Configuration

| Key | Meaning |
|---|---|
| `channels` | The channels this application configures. |
| `default` | The channels a notification uses when it names none. Defaults to `['log']`. |
| `recipients` | How to turn an id into a person. The one thing this module cannot ship. |
| `templates` | Templates, for an application with no translation catalogue. |
| `dispatch` | `queue` or `inline`. Defaults to `queue` when a queue is enabled. |
| `queue` / `attempts` | Which queue, and how many retries. |
| `notices` | Notices declared in configuration rather than with `@Notice`. Both are read. |
| `dedupe` | `{ ttl, store }`. Keys live in `@stone-js/cache`, so this module stores nothing of its own. |
| `announce` | Emit `notification.delivered` and `notification.failed` on the bus. On when a bus is enabled. |

## The same message twice

The most common production failure of any notification system: a queue is at-least-once, a retry
half succeeded, or two events describe one fact. Name the occurrence and the repeat is dropped:

```ts
await notifier.notify(user, 'welcome', {}, { dedupe: `welcome:${user.id}` })
```

A notice states its own through `dedupe(event)`. Keys are claimed atomically in the cache store the
application already chose. Without the cache module, deduplication does not happen and says so once:
sending twice in silence is the failure it exists to prevent.

## Who received what

This module keeps no delivery ledger, because the answer to "why did they never receive it" belongs
in whatever the application already queries. It announces instead:

```ts
@BusHandler()
export class NotificationLedger {
  @OnBusEvent('notification.failed')
  onFailed (event) { /* ... write your own row */ }
}
```

The event carries the notice, the channel, the outcome, whether it is worth retrying, and the
recipient's **id**, never their address: an address in an event is an address in every log that
event passes through.

## Seeing it before sending it

```ts
const previewed = await notifier.preview(guardian, 'guardianship.consent_needed', { child: 'Lea' })
// [{ recipient, channel: 'smtp', message: { subject, body, locale } }, ...]
```

Exactly what delivery would render, per channel, with nothing sent. For the screen that shows a
member of staff what a guardian is about to receive, and for a test that checks a notice without a
channel.

## Later rather than now

```ts
await notifier.notify(user, 'trial.ending', {}, { delay: 86_400 })
```

Deferred by the queue, because a timer held in a process a cold start can end is not a reminder.

## Documentation

See the [official documentation](https://stonejs.dev/docs/extensions/notifications) for the full
guide.

## License

[MIT](./LICENSE)
