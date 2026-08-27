# @stone-js/notifications

## 0.8.17

### Patch Changes

- 07b3cc9: fix: the security audit follows the lockfiles, and a few smells go with it

  A vulnerable transitive `uuid` sat in the monorepo starter, seen by Dependabot and by nothing else. Two separate holes let it, and both are measured rather than assumed.

  **The audit only looked at the root.** A starter with its own lockfile resolves independently: the root's `pnpm.overrides` never reached it, so the `uuid@<11.1.1` pin that protects every other package did nothing there. The audit now follows the **lockfiles** rather than the workspace, through `scripts/audit-lockfiles.mjs`, and CI runs the same script as `pnpm run audit:ci` so the two cannot drift. Verified by pointing it at the vulnerable lockfile: it fails and names the path, `apps__mobile>expo>@expo/config-plugins>xcode>uuid`.

  **The threshold was above the advisory.** `pnpm audit` classifies this one `moderate`, so a gate at `high` would never have stopped it, wherever it ran. Measured before changing it: the repository is clean at `low`, so `moderate` costs nothing today and catches the class that got through.

  Nothing local ran the audit either, so there is now a `pre-push` hook for it alone, seconds against the registry, and a `pnpm run verify` that bundles the whole pre-push gauntlet for when you want all of it.

  Also, twelve reported smells, each a real one. Four object literals used as default parameters, rebuilt on every call and now named values. `String(value)` on an `unknown` in two places, where an object would have landed as `[object Object]` in a message somebody reads or in a URL that matches no route: both now leave the placeholder, visibly unfinished. A nested template literal, a nested ternary, two verbose character classes, and an import that existed only to be re-exported.

- 31e3b2e: feat: one declaration reaches a person wherever they are

  `@stone-js/notifications` reaches someone by email, on an open tab, or through a channel you wrote, from one call:

  ```ts
  await notifier.notify(guardianId, "guardianship.consent_needed", { child });
  ```

  **Decide now, deliver later.** A request resolves who the person is, chooses the channels and dispatches a job; a worker performs the delivery, running the same code the inline path runs so a retry means exactly what the first attempt meant. Reaching a mail provider takes as long as it takes, and a request that waits for one times out on the endpoint the user is watching. Without a queue, delivery happens in the request, which is right for development and says so when it was not what you asked for.

  **A template key, never a rendered body.** What is not copied does not have to be erased, and a message queued before a translation was fixed goes out fixed. Keys are looked up in `@stone-js/i18n` under `<key>.subject` and `<key>.body`, in the **recipient's** locale, never the request's: a French-speaking guardian invited by an English-speaking member of staff reads French. A missing translation renders its key rather than an empty string, because an empty subject looks like a broken mail client and gets ignored for months.

  Three channels ship. `log` is the zero-config default: it writes the message where you write everything else, reaches nobody, and says so on first use, because a default that quietly sent real mail would send it from the first test run. `in-app` broadcasts on the recipient's own realtime channel, which is the half that makes this a module rather than a mail client wrapped in a service: one `notify()` reaches the mailbox and the tab, and the application wires neither to the other. `smtp` sends mail through `nodemailer`, over SMTP rather than a provider's API, so one channel reaches all of them without this package choosing a vendor for you.

  `sms` and `push` are deliberately not shipped: a channel that picked a vendor would be wrong for everyone who chose a different one. Register yours with `channels: [{ name, factory }]`, or as a class with `@NotificationChannel('sms')`, and it is a channel like any other.

  A channel **returns** an outcome rather than throwing, and the outcome says whether another attempt could work: a provider being down is retryable, an address that does not exist never will be, and retrying that forever is how a queue fills with work that cannot succeed. A channel that throws anyway is treated as retryable, since a throw is an adapter bug rather than a verdict; a setup mistake is reported as permanent so it is not retried into the ground.

  **What the module decides, and what it does not.** It decides who learns what, through which channel, and in which language. It never decides _whether_ to send: consent, preferences, quiet hours and audiences stay in the application, because the rules that matter there are about its own people. `notify()` also never throws at its caller, since a notification is almost always a side effect of something that already succeeded, and failing that operation because a provider was down would undo work that was correct.

  **A notice is a class, and the class is where the content lives.** `@Notice({ name, on, channels })` carries metadata only, with an imperative `defineNotice` that says the same thing. There is no `content` option, deliberately: text in a decorator is text that cannot be translated, formatted, or read off the event. The class answers `notify(event, { locale, recipient })` and returns a body **per channel**, because a text message is not an email; a channel it says nothing about falls back to the declared template rather than sending an empty body. It is built through the container, so it asks for i18n, a repository, a URL signer.

  **And with `on`, nobody calls the notifier.** A module emits what happened, and the notice that named that event decides who learns about it. The notice subscribes through the light key router, the same one `@stone-js/event-bus` routes domain events through, so the emitting module imports nothing and is never reopened when a channel is added. A coupling that does not exist cannot become a cycle. Reacting to an event makes `recipients(event)` required, because the event carries the account and only the notice knows which field that is: guessing would send to the wrong person.

  Three more things modern applications actually need. **Deduplication**, the most common production failure of any notification system: name an occurrence, through `dedupe` on the call or `dedupe(event)` on the notice, and the repeat is dropped. Keys are claimed atomically in `@stone-js/cache`, so the store is the one the application already chose; without it, deduplication does not happen and says so once. **Announcement**: each delivery emits `notification.delivered` or `notification.failed` on the bus, carrying the notice, the channel, the outcome and the recipient's id but never their address, so an application keeps the delivery ledger it wants without this module owning one. **A preview** that renders exactly what delivery would render, per channel, sending nothing, and a `delay` the queue defers, because a timer held in a process a cold start can end is not a reminder.

- Updated dependencies [07b3cc9]
  - @stone-js/core@0.8.17
  - @stone-js/i18n@0.8.17
  - @stone-js/queue@0.8.17
  - @stone-js/realtime@0.8.17
  - @stone-js/config@0.8.17
