---
"@stone-js/auth": patch
---

fix(auth): `resolveUser` may be asynchronous

`AuthenticateMiddleware` called the configured `resolveUser` without awaiting it, and the option was typed synchronous. Resolving a principal hits a store in any real application (the token subject has to become *your* user, and that first lookup often provisions the account), so `stone.auth.resolveUser` was unusable and consumers kept a second middleware of their own.

The option now accepts `Promiseable<unknown>` and the middleware awaits it. A synchronous resolver keeps working unchanged. Documented in the README, which never showed the option at all.
