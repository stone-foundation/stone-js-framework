---
"@stone-js/edge-adapter": minor
---

Add `@stone-js/edge-adapter`: deploy a Stone.js app to any WinterCG/edge or JS runtime with one-line serve helpers on top of `@stone-js/fetch-adapter`. `buildFetchHandler()` boots the app with the Fetch adapter forced current and returns a Web `fetch` handler; `serveCloudflare`, `serveVercel`, `serveNetlify`, `serveBun` and `serveDeno` wrap it into each platform's expected entrypoint (forwarding env/ctx where relevant). Build once, deploy anywhere — the same app, every edge.
