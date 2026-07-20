---
"@stone-js/fetch-adapter": minor
---

Add `@stone-js/fetch-adapter`: a Web-standard (WinterCG Fetch) adapter. `run()` returns a `fetch(request)` handler, so the same build deploys to Cloudflare Workers, Deno, Bun and Vercel/Netlify Edge — build once, deploy anywhere. Fully agnostic (no `node:http`/`proxy-addr`): `Request` → `IncomingHttpEvent` (URL, headers, query, cookies, JSON/urlencoded body, forwarded IP), `OutgoingHttpResponse` → `Response`. Ships `@Fetch()` + `fetchAdapterBlueprint`, incoming/response middleware and a default error handler.
