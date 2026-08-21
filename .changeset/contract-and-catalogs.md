---
"@stone-js/openapi": patch
"@stone-js/i18n": patch
"@stone-js/cli": patch
"@stone-js/resources": patch
"@stone-js/validation": patch
"@stone-js/authz": patch
---

fix: a documented endpoint keeps its payload, and a translated app answers in the caller's language

Found by reading a deployed contract and by building a bundle, not by reading code.

- **The response of a documented endpoint was empty.** Writing `200: { description: '…' }` in a route's `contract` replaced the derived success response instead of describing it, so every endpoint whose author had documented it carefully lost its schema: 27 of 29 in a live API. Statuses merge per status and per field now; a *different* success status still replaces the derived one, because an operation answering both `200` and `204` describes an endpoint that cannot exist.
- **A request schema that normalises before it judges took the whole document down.** Requests are described as `input` and responses as `output`: a transform has no output shape, and asking for one threw out of the entire generation, so the contract endpoint answered 500 because one body trimmed a string. A schema that still cannot be described is now left out alone, and reported.
- `$schema` no longer leaks into a document that declares OpenAPI 3.0, and an unnamed route no longer publishes `operationId: ""`.
- **Translations discovered at build time now say which locales exist.** Content negotiation is skipped entirely when `stone.i18n.locales` is empty, so a caller asking for French got the fallback language, and under lazy loading (the default) that is how an application answers raw keys: only the resolved locale is fetched, and the resolved locale was never the caller's. The generated module declares the locales the scan found, so `Accept-Language` works with no configuration at all.
- **`stone test` runs the framework inside the runner's module graph.** Discovery imports your modules at run time, and an installed package doing that sits outside the transform, so `import('app/Handler.ts')` reached Node directly and died on `Unknown file extension ".ts"`.
- The three discovery middlewares are gone: `@ApiResource`, `@ValidationSchema` and `@Policy` carry their own registration, so nothing needs to read the metadata back out.
- `ResourceContext<EventType, PrincipalType>` takes the event and the principal, `unknown` by default.
