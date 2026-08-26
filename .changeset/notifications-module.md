---
"@stone-js/notifications": patch
---

feat: one declaration reaches a person wherever they are

`@stone-js/notifications` reaches someone by email, on an open tab, or through a channel you wrote, from one call:

```ts
await notifier.notify(guardianId, 'guardianship.consent_needed', { child })
```

**Decide now, deliver later.** A request resolves who the person is, chooses the channels and dispatches a job; a worker performs the delivery, running the same code the inline path runs so a retry means exactly what the first attempt meant. Reaching a mail provider takes as long as it takes, and a request that waits for one times out on the endpoint the user is watching. Without a queue, delivery happens in the request, which is right for development and says so when it was not what you asked for.

**A template key, never a rendered body.** What is not copied does not have to be erased, and a message queued before a translation was fixed goes out fixed. Keys are looked up in `@stone-js/i18n` under `<key>.subject` and `<key>.body`, in the **recipient's** locale, never the request's: a French-speaking guardian invited by an English-speaking member of staff reads French. A missing translation renders its key rather than an empty string, because an empty subject looks like a broken mail client and gets ignored for months.

Three channels ship. `log` is the zero-config default: it writes the message where you write everything else, reaches nobody, and says so on first use, because a default that quietly sent real mail would send it from the first test run. `in-app` broadcasts on the recipient's own realtime channel, which is the half that makes this a module rather than a mail client wrapped in a service: one `notify()` reaches the mailbox and the tab, and the application wires neither to the other. `smtp` sends mail through `nodemailer`, over SMTP rather than a provider's API, so one channel reaches all of them without this package choosing a vendor for you.

`sms` and `push` are deliberately not shipped: a channel that picked a vendor would be wrong for everyone who chose a different one. Register yours with `channels: [{ name, factory }]`, or as a class with `@NotificationChannel('sms')`, and it is a channel like any other.

A channel **returns** an outcome rather than throwing, and the outcome says whether another attempt could work: a provider being down is retryable, an address that does not exist never will be, and retrying that forever is how a queue fills with work that cannot succeed. A channel that throws anyway is treated as retryable, since a throw is an adapter bug rather than a verdict; a setup mistake is reported as permanent so it is not retried into the ground.

**What the module decides, and what it does not.** It decides who learns what, through which channel, and in which language. It never decides *whether* to send: consent, preferences, quiet hours and audiences stay in the application, because the rules that matter there are about its own people. `notify()` also never throws at its caller, since a notification is almost always a side effect of something that already succeeded, and failing that operation because a provider was down would undo work that was correct.
