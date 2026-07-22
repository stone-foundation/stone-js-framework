# @stone-js/fetch-adapter

## 1.0.0

### Minor Changes

- 0edcba4: Add `@stone-js/fetch-adapter`: a Web-standard (WinterCG Fetch) adapter. `run()` returns a `fetch(request)` handler, so the same build deploys to Cloudflare Workers, Deno, Bun and Vercel/Netlify Edge — build once, deploy anywhere. Fully agnostic (no `node:http`/`proxy-addr`): `Request` → `IncomingHttpEvent` (URL, headers, query, cookies, JSON/urlencoded body, forwarded IP), `OutgoingHttpResponse` → `Response`. Ships `@Fetch()` + `fetchAdapterBlueprint`, incoming/response middleware and a default error handler.

### Patch Changes

- Updated dependencies [3308197]
  - @stone-js/core@1.0.0
  - @stone-js/filesystem@1.0.0
  - @stone-js/http-core@1.0.0
  - @stone-js/config@1.0.0
