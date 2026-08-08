---
"@stone-js/openapi": patch
---

feat(openapi): CLI plugin that generates TypeScript types from OpenAPI contracts

- Adds a `StoneCliPlugin` at `@stone-js/openapi/cli` that reads an OpenAPI 3.x or Swagger 2.x document at build time and emits TypeScript type definitions into `.stone/tmp/`. The runtime entry stays free of Node-only code.
- Accepts `source` (path or URL to an external document). When omitted, reads `.stone/tmp/openapi.json` — the convention for a document produced by an earlier build step.
- Uses `openapi-typescript` v7 as the engine, following the pattern established by `@stone-js/i18n/cli`.
- The generated module contributes to the built app via `addModule`, so the frontend can import types that never drift from the API contract.
