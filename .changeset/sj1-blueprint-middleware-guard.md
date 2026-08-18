---
"@stone-js/starters": patch
"@stone-js/core": patch
---

fix: a per-event middleware registered as a blueprint middleware no longer corrupts the whole app

Both `full-service-*` starters registered `CORSHeadersMiddleware` (an HTTP/kernel middleware) as a build-phase middleware through `defineBlueprintMiddleware`. Measured consequence on a pilot project: **every** response reached the client as an empty `OutgoingHttpResponse` (500, no content), router 404s included, while internal hooks reported a correct 200. Any project scaffolded from the starter answered 500 everywhere.

Root cause, found while writing the regression test: the build pipeline returns whatever its **outermost** middleware returned. A middleware that returns its own value instead of passing `next`'s result through replaces the blueprint with that value, so the application boots reading its configuration off an HTTP response.

- Both starters drop the line; `stone.http.cors.*` already configures CORS, which http-core runs in the kernel pipeline.
- `BlueprintBuilder.build()` now asserts the pipeline produced a blueprint and otherwise throws a `SetupError` naming the likely cause, so the mistake fails at setup instead of silently corrupting every response.
