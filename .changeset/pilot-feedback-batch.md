---
"@stone-js/auth": patch
"@stone-js/openapi": patch
"@stone-js/http-core": patch
"@stone-js/resources": patch
"@stone-js/core": patch
"@stone-js/i18n": patch
"@stone-js/mcp-dev": patch
"@stone-js/use-react-native": patch
---

fix: authentication reads the header, and a contract describes the API

Six defects reported from a pilot application, each reproduced before it was touched.

- `@stone-js/auth` read the bearer token with `event.get('Authorization')`, and that accessor deliberately refuses to read headers, because it also reads the query string and the body. So the real header was ignored, every request stayed anonymous, and `?Authorization=` would have been read in its place. It reads `getHeader` now.
- `@stone-js/openapi` documented every endpoint under `/`: a route's `path` is the pathname of the event it is answering, and no event is bound while generating a document. It reads the declared template, translates `:id` into `{id}`, declares the parameters the template requires, and publishes both paths for an optional segment.
- A Zod 4 schema converted to `{}`, an empty JSON Schema meaning "anything", so every documented body and response was silently unconstrained. A schema that can describe itself is now asked to.
- An explicit `contract:` block replaced everything derived, so documenting one `404` deleted the derived success response. It merges instead, per status, and a declared success status replaces the derived one rather than joining it.
- The derived success status was always `200`, even for a handler answering `201`. The response decorators now record the status they build, so the document cannot contradict the code it came from.
- `@stone-js/resources`: every `@ApiResource` the container resolved crashed on `checker`, an optional dependency read straight off the container, which resolves any name it is asked for and throws when nothing is bound.
- `@stone-js/core`: `@Middleware` could only ever declare kernel middleware, so a middleware that reads the matched route could be registered from a blueprint but not from the decorator. `layer: 'app' | 'kernel' | 'router'` closes that, `global` keeps working.

Packaging: `@stone-js/i18n`, `@stone-js/mcp-dev`, `@stone-js/openapi` and `@stone-js/use-react-native` published types referencing `@stone-js/cli` while declaring it as a dev dependency only. It is an optional peer now, so an application is never asked to resolve a package nobody told it about.
