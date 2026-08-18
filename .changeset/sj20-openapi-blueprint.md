---
"@stone-js/openapi": patch
---

feat(openapi): serve the contract and its explorer from one opt-in line

Every application rewrote the same handler with the same two routes, although the library already shipped `swaggerUiHtml()` and `OpenApiGenerator.build()`. Only the wiring was missing.

`blueprint.set(openApiBlueprint)` now serves `/openapi.json` and `/docs`, both configurable under `stone.openapi` (paths, `info`, routes, a pre-built document, Swagger UI options), with `docsPath: false` to serve the machine-readable contract alone.

**The advertised server URL comes from the request**, not from configuration: the same artefact runs behind a local port, a load balancer and an API Gateway stage, so a URL frozen at build time is wrong for at least two of them. Declaring `servers` overrides it.

The package now declares `@stone-js/core` as a peer dependency, which it imports and previously did not declare.
