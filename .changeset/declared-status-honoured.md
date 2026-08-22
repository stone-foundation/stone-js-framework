---
"@stone-js/http-core": patch
---

fix: an agnostic error carrying a status is answered with it, not 500

The HTTP error handler mapped errors by name with a 500 fallback, so any error from an agnostic module answered `500` however clearly it had declared otherwise. Authorization's `403` was already reaching callers as `500`; a rate limit's `429` would have followed.

An error that declares a `statusCode` in the 4xx/5xx range is now answered with it, together with its `statusMessage` and its headers, which is how a `Retry-After` travels out of a module that knows nothing about HTTP. Anything outside that range, or no declared status at all, still answers `500`: a module cannot talk the platform into an invalid response by mistake.
