---
"@stone-js/i18n": patch
"@stone-js/telemetry": patch
---

feat: an injected i18n speaks the caller's language, and telemetry says which build is answering

**The request locale reaches every reader.** `SetLocaleMiddleware` put a bound translator on the event and left the instance alone, so code that never sees the event translated in the configured locale whatever the caller asked for: a service written `constructor ({ i18n })`, the `i18next` binding, the helpers. The middleware now moves the request's own instance to the resolved locale as well.

That is sound because Stone.js builds the kernel and its container per event, so the instance being moved belongs to one request. Verified on a real server: `fr`, then `en`, then `fr`, each answered in its own language with no crosstalk. The event still carries the bound clone, for code that prefers to depend on nothing ambient.

One coupling was removed on the way: the resolution chain ended on the instance's current locale, which would have made one caller's language the next caller's default wherever an instance outlives a single event, a browser application above all. `I18nManager.configuredLocale` is now that last resort: the locale the application was configured with, which never moves.

**`/version`, next to `/health`.** A probe is asked by a platform that cannot read and needs a verdict; this is asked by a person mid-investigation and the answer is a fact:

```
curl https://api.example/version
{"name":"my-api","env":"production","platform":"aws_lambda_http","release":"2026.08.21-3"}
```

`platform` earns its place: one artefact can carry several adapters, each claiming the runtime it detects, so which one won is not knowable from the outside. The release is declared through the blueprint (`stone.telemetry.version.release`), never guessed from the environment. `path: false` serves nothing, and like the probe it stays out of the published contract.
